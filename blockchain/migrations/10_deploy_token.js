/* eslint-disable no-undef */
/* eslint-disable indent */

const PlayToken = artifacts.require('./PlayToken.sol');

module.exports = function (deployer) { // eslint-disable-line
    const tokenController = web3.eth.accounts[0];

    console.log(`deploying PlayToken with contoller address ${tokenController}`);
    deployer.deploy(PlayToken, tokenController);
};
