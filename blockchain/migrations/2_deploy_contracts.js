var P4P = artifacts.require("./P4P.sol");

module.exports = function(deployer) {
  deployer.deploy([
      P4P
  ]);
};
