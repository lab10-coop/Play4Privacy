var PlayToken = artifacts.require("./PlayToken.sol");

module.exports = function(deployer) {
    deployer.deploy(PlayToken, web3.eth.accounts[0]);
}