/* eslint-disable indent */

const P4PDonationSplitter = artifacts.require('./P4PDonationSplitter.sol');

module.exports = async function (deployer) {  // eslint-disable-line
    await deployer.deploy(P4PDonationSplitter);
};
