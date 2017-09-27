pragma solidity ^0.4.15;

import "./PlayToken.sol";

/** @title P4P Donation Pool

Contract which receives donations for privacy projects.
Donators will be rewarded with PLAY tokens.

The donation process is 2-phased.
Donations of the first round will be weighted twice as much compared to later donations.

The received Ether funds will not be accessible during the donation period.
Donated Eth can be retrieved only after the donation rounds are over and the set unlock timestamp is reached.
In order to never own the funds, the contract owner can set and lock the receiver address beforehand.
The receiver address can be an external account or a distribution contract.

Note that there's no way for the owner to withdraw tokens assigned to donators which aren't withdrawn.
In case destroy() is invoked, they will effectively be burned.
*/
contract P4PPool {
    address public owner;
    PlayToken public playToken;

    uint8 public currentState = 0;
    // valid states (not using enum in order to be able to simply increment in startNextPhase()):
    uint8 public constant STATE_NOT_STARTED = 0;
    uint8 public constant STATE_DONATION_ROUND_1 = 1;
    uint8 public constant STATE_PLAYING = 2;
    uint8 public constant STATE_DONATION_ROUND_2 = 3;
    uint8 public constant STATE_PAYOUT = 4;

    uint256 public tokenPerEth; // calculated after finishing donation rounds

    mapping(address => uint256) round1Donations;
    mapping(address => uint256) round2Donations;

    // glitch: forgot to rename those from "phase" to "round" too
    uint256 public totalPhase1Donations = 0;
    uint256 public totalPhase2Donations = 0;

    // 1509494400 = 2017 Nov 01, 00:00 (UTC)
    uint32 public donationUnlockTs = uint32(now); //1509494400;

    // share of the pooled tokens the owner (developers) gets in percent
    uint8 public constant ownerTokenSharePct = 20;

    address public donationReceiver;
    bool public donationReceiverLocked = false;

    event StateChanged(uint8 newState);
    event DonatedEthPayout(address receiver, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier onlyDuringDonationRounds() {
        require(currentState == STATE_DONATION_ROUND_1 || currentState == STATE_DONATION_ROUND_2);
        _;
    }

    modifier onlyIfPayoutUnlocked() {
        require(currentState == STATE_PAYOUT);
        require(uint32(now) >= donationUnlockTs);
        _;
    }

    /** @dev constructor */
    function P4PPool(address _tokenAddr) {
        owner = msg.sender;
        playToken = PlayToken(_tokenAddr);
    }

    /** So called "fallback function" which handles incoming Ether payments
    Remembers which address payed how much, doubling round 1 contributions.
    */
    function () payable onlyDuringDonationRounds {
        donateForImpl(msg.sender);
    }

    /** Receives Eth on behalf of somebody else
    Can be used for proxy payments.
    */
    function donateFor(address _donor) payable onlyDuringDonationRounds {
        donateForImpl(_donor);
    }

    function startNextPhase() onlyOwner {
        require(currentState <= STATE_PAYOUT);
        currentState++;
        if(currentState == STATE_PAYOUT) {
            // donation ended. Calculate and persist the distribution key:
            tokenPerEth = calcTokenPerEth();
        }
        StateChanged(currentState);
    }

    function setDonationUnlockTs(uint32 _newTs) onlyOwner {
        require(_newTs > donationUnlockTs);
        donationUnlockTs = _newTs;
    }

    function setDonationReceiver(address _receiver) onlyOwner {
        require(! donationReceiverLocked);
        donationReceiver = _receiver;
    }

    function lockDonationReceiver() onlyOwner {
        require(donationReceiver != 0);
        donationReceiverLocked = true;
    }

    // this could be left available to everybody instead of owner only
    function payoutDonations() onlyOwner onlyIfPayoutUnlocked {
        require(donationReceiver != 0);
        var amount = this.balance;
        require(donationReceiver.send(amount));
        DonatedEthPayout(donationReceiver, amount);
    }

    /** Emergency fallback for retrieving funds
    In case something goes horribly wrong, this allows to retrieve Eth from the contract.
    Becomes available at March 1 2018.
    If called, all tokens still owned by the contract (not withdrawn by anybody) are burned.
    */
    function destroy() onlyOwner {
        require(currentState == STATE_PAYOUT);
        require(now > 1519862400);
        selfdestruct(owner);
    }

    /** Allows donators to withdraw the share of tokens they are entitled to */
    function withdrawTokenShare() {
        require(tokenPerEth > 0); // this implies that donation rounds have closed
        require(playToken.transfer(msg.sender, calcTokenShareOf(msg.sender)));
        round1Donations[msg.sender] = 0;
        round2Donations[msg.sender] = 0;
    }

    // ######### INTERNAL FUNCTIONS ##########

    function calcTokenShareOf(address _addr) constant internal returns(uint256) {
        if(_addr == owner) {
            // TODO: this could probably be simplified. But does the job without requiring additional storage
            var virtualEthBalance = (((totalPhase1Donations*2 + totalPhase2Donations) * 100) / (100 - ownerTokenSharePct) + 1);
            return ((tokenPerEth * virtualEthBalance) * ownerTokenSharePct) / (100 * 1E18);
        } else {
            return (tokenPerEth * (round1Donations[_addr]*2 + round2Donations[_addr])) / 1E18;
        }
    }

    // Will throw if no donations were received.
    function calcTokenPerEth() constant internal returns(uint256) {
        var tokenBalance = playToken.balanceOf(this);
        // the final + 1 makes sure we're not running out of tokens due to rounding artifacts.
        // that would otherwise be (theoretically, if all tokens are withdrawn) possible,
        // because this number acts as divisor for the return value.
        var virtualEthBalance = (((totalPhase1Donations*2 + totalPhase2Donations) * 100) / (100 - ownerTokenSharePct) + 1);
        // use 18 decimals precision. No danger of overflow with 256 bits.
        return tokenBalance * 1E18 / (virtualEthBalance);
    }

    function donateForImpl(address _donor) internal onlyDuringDonationRounds {
        if(currentState == STATE_DONATION_ROUND_1) {
            round1Donations[_donor] += msg.value;
            totalPhase1Donations += msg.value;
        } else if(currentState == STATE_DONATION_ROUND_2) {
            round2Donations[_donor] += msg.value;
            totalPhase2Donations += msg.value;
        }
    }
}