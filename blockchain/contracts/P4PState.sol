pragma solidity ^0.4.15;

/**
The purpose of this contract is to provide a dummy contract for persisting game state.
The contract itself doesn't create any state data, just acts as a documented interface.
See https://medium.com/childsmaidment/stateless-smart-contracts-21830b0cd1b6

Note that no access restrictions are placed on the contract, thus make sure you're looking at the right transaction.
*/
contract P4PState {
    /** Stateless contract for persisting game states
    @param states IPFS hashes (stripped of the type-length-value, see https://multiformats.io/multihash/)
    of files containing raw game state data.
    @param boards bitmap of the final gameboard state. Encoding:
    0: unset, 1: black, 2: white. Which means 2 bit per field
    Example: 3 fields black, white, unset encode to 1, 2, 0 => 0b011100
    We have 9x9 = 81 fields. Thus 162 bit or 21 bytes (ceil(81 / 4)) are needed.
    Remaining bits are set to 0.
    */
    function addGames(bytes32[] states, bytes32[] boards) {}
}