pragma solidity ^0.4.16;

contract P4P {
    address owner;
    PlayToken playToken;
    mapping(bytes32 => bool) gamesPlayed;

    event TokenCreated(address);
    event GamePlayed(bytes32 hash);

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    // constructor
    function P4P() {
        owner = msg.sender;
        playToken = new PlayToken();
        TokenCreated(address(playToken));
    }

    function gamePlayed(bytes32 gameHash, address[] players) onlyOwner {
        // TODO: what's the right order here?
        gamesPlayed[gameHash] = true;
        GamePlayed(gameHash);
        payoutPlayers(players);
    }

    /*
    * This function allows to add players to a game in case including them all
    * in a single call of gamePlayed() isn't feasible (e.g. due to the block gas limit)
    */
    function addPlayers(bytes32 gameHash, address[] players) onlyOwner {
        require(gamesPlayed[gameHash]);
        payoutPlayers(players);
    }

    function payoutPlayers(address[] players) internal {
        for (uint i = 0; i < players.length; i++) {
            playToken.mint(players[i], 1);
        }
    }

    function getTokenAddress() constant returns(address) {
        return address(playToken);
    }
}