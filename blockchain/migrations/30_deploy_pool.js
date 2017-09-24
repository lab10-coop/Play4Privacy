var PlayToken = artifacts.require("./PlayToken.sol");
var P4PGame = artifacts.require("./P4PGame.sol");
var P4PPool = artifacts.require("./P4PPool.sol");

module.exports = async function(deployer, network) {
    let tokenAddress = PlayToken.address;
    if(network == "rinkeby") {
        tokenAddress = "0xbe3786f31d3197365d1e4a3305ad9a9f8f3ec495";
    } else if(network == "live") {
        tokenAddress = "0xfb41f7b63c8e84f4ba1ecd4d393fd9daa5d14d61";
    }

    console.log(`deploying P4PPool with token address ${tokenAddress}`);
    const pool = await deployer.deploy(P4PPool, tokenAddress);

    const game = await P4PGame.deployed();
    console.log(`setting in game contract ${game.address}: pool ${P4PPool.address}`);
    await game.setPoolContract(P4PPool.address);
}