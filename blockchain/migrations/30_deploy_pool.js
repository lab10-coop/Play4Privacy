/* eslint-disable no-undef */
/* eslint-disable indent */

const PlayToken = artifacts.require('./PlayToken.sol');
const P4PGame = artifacts.require('./P4PGame.sol');
const P4PPool = artifacts.require('./P4PPool.sol');

module.exports = async function (deployer) {  // eslint-disable-line
    const tokenAddress = PlayToken.address;

    console.log(`deploying P4PPool with token address ${tokenAddress}`);
    await deployer.deploy(P4PPool, tokenAddress);

    const game = await P4PGame.deployed();
    console.log(`setting in game contract ${game.address}: pool ${P4PPool.address}`);
    await game.setPoolContract(P4PPool.address);
};
