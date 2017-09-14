pragma solidity ^0.4.15;

import "./PlayToken.sol";

/**
@title Contract for the Play4Privacy application.

Persists games played (represented by a hash) and distributes PLAY tokens to players per game.
This contract does not accept Ether payments.
*/
contract P4P {
    address owner;
    PlayToken playToken;
    mapping(bytes32 => bool) gamesPlayed;

    event GamePlayed(bytes32 hash);

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    /**
    @dev Constructor

    Creates a contract for the associated PLAY Token
    */
    function P4P() {
        owner = msg.sender;
        playToken = new PlayToken(this);
    }

    /** Proxy function for Token */
    function setTokenController(address _controller) onlyOwner {
        playToken.setController(_controller);
    }

    /** Proxy function for Token */
    function lockTokenController() onlyOwner {
        playToken.lockController();
    }

    /**
    Called after a game round has been played.

    @param gameHash a reference to an offchain data record of the game end state (can contain arbitrary details).
    @param players array of addresses of players to which a PLAY token is distributed.
    @param amounts array specifying the amount of tokens per given player. Needs to have the same size as the players array.

    NOTE: It's the callers responsibility not to exceed the gas limit ("too many" players).
    If not all players "fit" into one transaction, "addPlayers()" can be used to add them.
    */
    function gamePlayed(bytes32 gameHash, address[] players, uint8[] amounts) onlyOwner {
        /* TODO: what's the right order here? */
        require(players.length == amounts.length);
        gamesPlayed[gameHash] = true;
        GamePlayed(gameHash);
        payoutPlayers(players, amounts);
    }

    /**
    Allows to add players to a game in case including them all
    in a single call of gamePlayed() isn't feasible (e.g. due to the block gas limit).

    @param gameHash References the game to which the players should be added. Must exist (call fails otherwise)!
    @param players array of addresses of players to which a PLAY token is distributed.
    @param amounts array specifying the amount of tokens per given player. Needs to have the same size as the players array.

    NOTE: If there's (still) more players than can be processes in one transaction,
    call this multiple times with batches of them.
    */
    function addPlayers(bytes32 gameHash, address[] players, uint8[] amounts) onlyOwner {
        require(players.length == amounts.length);
        require(gamesPlayed[gameHash]);
        payoutPlayers(players, amounts);
    }

    /**
    Redeems PLAY tokens to the given set of players by invoking mint() of the associated token contract.

    NOTE: Since this contains a loop, it relies on the caller providing enough gas
    and not exceeding the block gas limit because of a too large array.
    */
    function payoutPlayers(address[] players, uint8[] amounts) internal {
        for (uint i = 0; i < players.length; i++) {
            // amounts are converted to the token base unit (including decimals)
            playToken.mint(players[i], uint256(amounts[i]) * 1e18);
        }
    }

    function getTokenAddress() constant returns(address) {
        return address(playToken);
    }
}