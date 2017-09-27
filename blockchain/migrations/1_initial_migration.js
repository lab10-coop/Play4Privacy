var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer, network) {
    // Deploy the Migrations contract as our only task
    deployer.deploy(Migrations);
};
