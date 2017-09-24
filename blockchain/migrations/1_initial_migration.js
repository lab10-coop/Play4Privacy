var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer, network) {
    // deployment of this contract is only needed for testing, thus disabled on live net
    if (network != "live" && network != "rinkeby") {
        // Deploy the Migrations contract as our only task
        deployer.deploy(Migrations);
    }
};
