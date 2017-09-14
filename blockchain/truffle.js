module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      host: "rinkeby.eth.lab10.io",
      port: 80,
      network_id: "4"
    }
  }
};
