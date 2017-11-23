/* eslint-disable indent */

const P4PState = artifacts.require('./P4PState.sol');

module.exports = async function (deployer) {  // eslint-disable-line
    await deployer.deploy(P4PState);
};
