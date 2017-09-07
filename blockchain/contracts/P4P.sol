pragma solidity ^0.4.15;

import "./PlayToken.sol";

/**
@title Contract for the Play4Privacy application.

Persists games played (represented by a hash) and distributes PLAY tokens to players per game round.
Can receive Ether (e.g. for game credits) which are distributed among registered receivers after every game round.
The logic for such game credits (e.g. costs, validity etc.) is to be handled outside the contract.
That way it poses no restrictions on how it can be used. This allows also e.g. voluntary donations.
*/
contract P4P {
    address owner;
    PlayToken playToken;
    mapping(bytes32 => bool) gamesPlayed;
    address[] fundReceivers;

    event TokenCreated(address);
    event GamePlayed(bytes32 hash);
    event FundsDistributed(uint _totalDistributed, address[] _receivers);

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    /**
    @dev Constructor

    Creates a contract for the associated PLAY Token - which implies that only this contract
    can call its mint() function.
    */
    function P4P() {
        owner = msg.sender;
        playToken = new PlayToken();
        TokenCreated(address(playToken));
    }

    /**
    Contract can receive Ether (e.g. for buying game credits)
    TODO: do we need to trigger an event? Can we afford that (gas cost)?
    */
    function() payable {}

    /**
    For configuring who receives the Ether funds (donations) after every game round.
    Limited to 10 addresses (arbitrary choice) in order to avoid gas issues (payout loop).
    The contract balance is distributed evenly among the registered receivers.

    NOTE: Calling this overwrites previously registered receivers (no "add" semantics)
    */
    function setFundReceivers(address[] _receivers) onlyOwner {
        require(_receivers.length <= 10);
        fundReceivers = _receivers;
    }

    /**
    Called after a game round has been played.

    @param gameHash a reference to an offchain data record of the game end state (can contain arbitrary details).
    @param players array of addresses of players to which a PLAY token is distributed.

    NOTE: It's the callers responsibility not to exceed the gas limit ("too many" players).
    If not all players don't "fit" into one transaction, "addPlayers()" should be used.
    */
    function gamePlayed(bytes32 gameHash, address[] players) onlyOwner {
        /* TODO: what's the right order here? */
        gamesPlayed[gameHash] = true;
        GamePlayed(gameHash);
        payoutFunds();
        payoutPlayers(players);
    }

    /**
    Allows to add players to a game in case including them all
    in a single call of gamePlayed() isn't feasible (e.g. due to the block gas limit.

    @param gameHash References the game to which the players should be added. Must exist!
    @param players array of addresses of players to which a PLAY token is distributed.

    NOTE: If there's (still) more players than can be processes in one transaction,
    call this multiple times with batches of them.
    */
    function addPlayers(bytes32 gameHash, address[] players) onlyOwner {
        require(gamesPlayed[gameHash]);
        payoutPlayers(players);
    }

    /**
    Pays out Ether funds owned by the contract to the currently registered receivers.
    A few wei may remain in the pool after this call if the balance can't be divided evenly.
    This is called by gamePlayed().

    NOTE: Since this contains a loop, it relies on the fundsReceiver array not containing more entries
    than "fit" into the block gas limit.
    */
    function payoutFunds() internal {
        if(fundReceivers.length > 0 && this.balance > 0) {
            /* If the result isn't an integer, it is rounded (floor). */
            var amountPerReceiver = this.balance / fundReceivers.length;
            for (uint i = 0; i < fundReceivers.length; i++) {
                fundReceivers[i].transfer(amountPerReceiver);
            }
            FundsDistributed(amountPerReceiver * fundReceivers.length, fundReceivers);
        }
    }

    /**
    Redeems PLAY tokens to the given set of players by invoking mint() of the associated token contract.

    NOTE: Since this contains a loop, it relies on the caller providing enough gas
    and not exceeding the block gas limit because of a too large array.
    */
    function payoutPlayers(address[] players) internal {
        for (uint i = 0; i < players.length; i++) {
            playToken.mint(players[i], 1);
        }
    }

    function getTokenAddress() constant returns(address) {
        return address(playToken);
    }

    function getFundReceivers() constant returns(address[]) {
        return fundReceivers;
    }
}
