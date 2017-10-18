/* eslint-disable no-undef */
/* eslint-disable indent */

const PlayToken = artifacts.require('./PlayToken.sol');
const P4PGame = artifacts.require('./P4PGame.sol');
// var P4PPool = artifacts.require("./P4PPool.sol");

module.exports = async function (deployer) { // eslint-disable-line
    const tokenAddress = PlayToken.address;

    console.log(`deploying P4PGame with token address ${tokenAddress}`);
    await deployer.deploy(P4PGame, tokenAddress, 0); // pool addr is set later

    // this can be done only if the current account owns the token contract. Not the case on mainnet
    console.log(`setting in token contract ${tokenAddress}: controller ${P4PGame.address}`);
    const token = PlayToken.at(tokenAddress);
    await token.setController(P4PGame.address);
};
