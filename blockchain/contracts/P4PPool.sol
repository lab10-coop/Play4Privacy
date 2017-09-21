pragma solidity ^0.4.15;

import "./PlayToken.sol";

/** @title P4P Donation Pool

Contract which receives donations for privacy projects.
Donators will be rewarded with PLAY tokens.

The donation process is 2-phased.
Donations of the first phase will be weighted twice as much compared to later donations.

The received Ether funds will not be accessible during the donation period.
Once the donation period is over, the contract owner can set the payout addresses.

As a fallback mechanism, if no payout addresses are set for a while,
the contract owner will be able to withdraw contract owner Ether.

After all is done, the contract commits suicide in order to prevent haywire due to 32 bit timer wraps.

TODO: what happens to tokens which aren't withdrawn? Leave in pool or unlock for donation after some time?
*/
contract P4PPool {
    address public owner;
    PlayToken public playToken;
    // timestamps and time intervals are in seconds
    // 0: not started. 1: phase1. 2: phase2. 3: donation over
    uint8 public currentPhase = 0;
    uint256 public tokenPerEth; // calculated after finishing donation rounds
    //uint32 public startTs = 0xffff;
    //uint32 public durationPhase1 = 0;
    //uint32 public durationPhase2 = 0;
    //uint32 public payoutUnlockedTs;
    mapping(address => uint256) phase1Donations;
    mapping(address => uint256) phase2Donations;
    uint256 public totalPhase1Donations = 0;
    uint256 public totalPhase2Donations = 0;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier onlyDuringDonationPhase() {
        //require(inPhase1() || inPhase2());
        require(currentPhase == 1 || currentPhase == 2);
        _;
    }

    modifier onlyIfPayoutUnlocked() {
        //require(uint32(now) > payoutUnlockedTs);
        require(currentPhase == 3);
        _;
    }

    /** @dev constructor */
    function P4PPool(address _tokenAddr) {
        owner = msg.sender;
        setTestValues(); // TODO: change before deploy
        playToken = PlayToken(_tokenAddr);
    }

    /** So called "fallback function" which handles incoming Ether payments
    Remembers which address payed how much, doubling phase 1 contributions.
    */
    function () payable onlyDuringDonationPhase {
        if(inPhase1()) {
            phase1Donations[msg.sender] += msg.value;
            totalPhase1Donations += msg.value;
        } else if(inPhase2()) {
            phase2Donations[msg.sender] += msg.value;
            totalPhase2Donations += msg.value;
        } else {
            revert(); // should not be reachable
        }
    }

    function startNextPhase() onlyOwner returns(uint8) {
        require(currentPhase <= 3);
        currentPhase++;

        if(currentPhase == 3) {
            // donation ended. Calculate and persist the distribution key:
            tokenPerEth = calcTokenPerEth();
        }
        return currentPhase;
    }

    function payoutDonations(address _to) onlyOwner onlyIfPayoutUnlocked {
        require(_to.send(this.balance));
    }

    /** Allows donators to withdraw the share of tokens they are entitled to */
    function withdrawTokenShare() {
        require(tokenPerEth > 0); // this implies that donation rounds have closed
        require(playToken.transfer(msg.sender, calcTokenShareOf(msg.sender)));
        phase1Donations[msg.sender] = 0;
        phase2Donations[msg.sender] = 0;
    }

    function calcTokenShareOf(address _addr) constant internal returns(uint256) {
        return (tokenPerEth * (phase1Donations[_addr]*2 + phase2Donations[_addr])) / 1E18;
    }

    // Will throw if no donations were received.
    function calcTokenPerEth() constant internal returns(uint256) {
        var tokenBalance = playToken.balanceOf(this);
        var virtualEthBalance = totalPhase1Donations*2 + totalPhase2Donations;
        // use 18 decimals precision. No danger of overflow with 256 bits.
        return tokenBalance * 1E18 / virtualEthBalance;
    }

    function inPhase1() constant internal returns(bool) {
        //return (uint32(now) >= startTs) && (uint32(now) < startTs + durationPhase1);
        return currentPhase == 1;
    }

    function inPhase2() constant internal returns(bool) {
        //return (uint32(now) >= startTs + durationPhase1) && (uint32(now) < startTs + durationPhase1 + durationPhase2);
        return currentPhase == 2;
    }

    // ############### TESTING STUFF ################
    function getCurrentTime() returns(uint32) {
        return uint32(now);
    }

    function setZero() {
        phase1Donations[msg.sender] = 0;
    }

    function setTestValues() {
        //address _tokenAddr = 0xaaa8080b22aee06b2dc722816bd2af61e296209f;
        //playToken = ITransferable(_tokenAddr);
        //playToken = new PlayTokenCopy(this);
        //playToken.mint(this, 1000000007);
        //startTs = uint32(now);
        //payoutUnlockedTs = startTs + 30;
    }

    function ethBalOf(address _to) constant returns(uint256) {
        return _to.balance;
    }

    function poolEthBal() constant returns(uint256) {
        return ethBalOf(this);
    }

    function myEthBal() constant returns(uint256) {
        return ethBalOf(msg.sender);
    }
}