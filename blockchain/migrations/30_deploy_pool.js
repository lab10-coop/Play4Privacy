var PlayToken = artifacts.require("./PlayToken.sol");
var P4P = artifacts.require("./P4P.sol");
var P4PPool = artifacts.require("./P4PPool.sol");

module.exports = async function(deployer) {
    await deployer.deploy(P4PPool, PlayToken.address);

    const game = await P4P.deployed();
    await game.setPoolContract(P4PPool.address);
}