pragma solidity ^0.4.15;

import "./PlayToken.sol";

/**
@title Contract for the Play4Privacy application.

Persists games played (represented by a hash) and distributes PLAY tokens to players and to a pool per game.
This contract does not accept Ether payments.
*/
contract P4PGame {
    address public owner;
    address public pool;
    PlayToken playToken;
    bool public active = true;

    event GamePlayed(bytes32 hash, bytes32 boardEndState);
    event GameOver();

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier onlyIfActive() {
        require(active);
        _;
    }

    /**
    @dev Constructor

    Creates a contract for the associated PLAY Token.
    */
    function P4PGame(address _tokenAddr, address _poolAddr) {
        owner = msg.sender;
        playToken = PlayToken(_tokenAddr);
        pool = _poolAddr;
    }

    /** Proxy function for Token */
    function setTokenController(address _controller) onlyOwner {
        playToken.setController(_controller);
    }

    /** Proxy function for Token */
    function lockTokenController() onlyOwner {
        playToken.lockController();
    }

    /** Sets the address of the contract to which all generated tokens are duplicated. */
    function setPoolContract(address _pool) onlyOwner {
        pool = _pool;
    }

    /** Persists proof of the game state and final board eternally
    @param hash a reference to an offchain data record of the game end state (can contain arbitrary details).
    @param board encoded bitmap of the final state of the Go board
    */
    function addGame(bytes32 hash, bytes32 board) onlyOwner onlyIfActive {
        GamePlayed(hash, board);
    }

    /** Distributes tokens for playing
    @param receivers array of addresses to which PLAY tokens are distributed.
    @param amounts array specifying the amount of tokens per receiver. Needs to have the same size as the receivers array.

    It's the callers responsibility to limit the array sizes such that the transaction doesn't run out of gas
    */
    function distributeTokens(address[] receivers, uint16[] amounts) onlyOwner onlyIfActive {
        require(receivers.length == amounts.length);
        var totalAmount = distributeTokensImpl(receivers, amounts);
        payoutPool(totalAmount);
    }

    /** Disables the contract
    Once this is called, no more games can be played and no more tokens distributed.
    This also implies that no more PLAY tokens can be minted since this contract has exclusive permission to do so
    - assuming that this contract is locked as controller in the Token contract.
    */
    function shutdown() onlyOwner {
        active = false;
        GameOver();
    }

    function getTokenAddress() constant returns(address) {
        return address(playToken);
    }

    // ######### INTERNAL FUNCTIONS ##########

    /**
    Redeems PLAY tokens to the given set of receivers by invoking mint() of the associated token contract.

    @return the total amount of tokens payed out
    */
    function distributeTokensImpl(address[] receivers, uint16[] amounts) internal returns(uint256) {
        uint256 totalAmount = 0;
        for (uint i = 0; i < receivers.length; i++) {
            // amounts are converted to the token base unit (including decimals)
            playToken.mint(receivers[i], uint256(amounts[i]) * 1e18);
            totalAmount += amounts[i];
        }
        return totalAmount;
    }

    /** Commits one token for every token generated to the pool (batched) */
    function payoutPool(uint256 amount) internal {
        require(pool != 0);
        playToken.mint(pool, amount * 1e18);
    }
}