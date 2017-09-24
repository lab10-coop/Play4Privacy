var PlayToken = artifacts.require("./PlayToken.sol");
var P4PGame = artifacts.require("./P4PGame.sol");
var P4PPool = artifacts.require("./P4PPool.sol");

module.exports = async function(deployer, network) {
    let tokenAddress = PlayToken.address;

    console.log(`deploying P4PPool with token address ${tokenAddress}`);
    const pool = await deployer.deploy(P4PPool, tokenAddress);

    const game = await P4PGame.deployed();
    console.log(`setting in game contract ${game.address}: pool ${P4PPool.address}`);
    await game.setPoolContract(P4PPool.address);
}