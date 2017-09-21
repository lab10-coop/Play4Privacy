var PlayToken = artifacts.require("./PlayToken.sol");
var P4P = artifacts.require("./P4P.sol");
//var P4PPool = artifacts.require("./P4PPool.sol");

module.exports = async function(deployer) {
    await deployer.deploy(P4P, PlayToken.address);

    const token = await PlayToken.deployed();
    await token.setController(P4P.address);
}

/*
module.exports = function(deployer) {
    deployer.deploy(P4P).then( game => {
        //console.log(`deploy returned ${JSON.stringify(gameAddr)}`);
        tokenAddr = game.getTokenAddress();
        console.log(`PlayToken was deployed to ${tokenAddr}`);
        deployer.deploy(P4PPool, tokenAddr);
    });
};
*/


/*
module.eports = function(deployer) {
    deployer.deploy(P4P).then( ())
}
*/

// see http://truffleframework.com/docs/getting_started/migrations
/*
module.exports = function(deployer) {
    deployer.then( () => {
        return P4P.new();
    }).then( (game) => {
        console.log(`P4P was deployed to ${game.address}`);
        const tokenAddr = game.getTokenAddress();
        console.log(`PlayToken was deployed to ${tokenAddr}`);
        return P4PPool.new(tokenAddr);
    });
};
*/

/*
module.exports = function(deployer) {
  deployer.then( () => {
      return P4P.new();
  }).then( (game) => {
      console.log(`P4P was deployed to ${game.address}`);
      return game.getTokenAddress();
  }).then((tokenAddr) => {
      console.log(`PlayToken was deployed to ${tokenAddr}`);
      return P4PPool.new(tokenAddr);
  }).then((pool) => {
      console.log(`P4PPool was deployed to ${pool.address}`);
  });
};
*/