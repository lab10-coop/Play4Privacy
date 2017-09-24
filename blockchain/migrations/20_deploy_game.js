var PlayToken = artifacts.require("./PlayToken.sol");
var P4PGame = artifacts.require("./P4PGame.sol");
//var P4PPool = artifacts.require("./P4PPool.sol");

module.exports = async function(deployer, network) {
    let tokenAddress = PlayToken.address;
    if(network == "rinkeby") {
        tokenAddress = "0xA84C4F24bd820aeC9aaB8dff14AFCa950f04e994";
    } else if(network == "live") {
        tokenAddress = "0xfb41f7b63c8e84f4ba1ecd4d393fd9daa5d14d61";
    }

    console.log(`deploying P4PGame with token address ${tokenAddress}`);
    const game = await deployer.deploy(P4PGame, tokenAddress);

    if(network == "development") {
        // this can be done only if the current account owns the token contract. Not the case on mainnet
        console.log(`setting in token contract ${tokenAddress}: controller ${P4PGame.address}`);
        const token = PlayToken.at(tokenAddress);
        await token.setController(P4PGame.address);
    } else {
        console.log("!!!");
        console.log(`YOU NEED TO MANUALLY SET NEW CONTROLLER ${P4PGame.address} IN TOKEN ${tokenAddress}`);
        console.log("!!!");
    }
}