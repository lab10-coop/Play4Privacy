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
      network_id: "4",
      gas: 3000000,
      gasPrice: 22000000000
    },
    mainnet: {
      host: "localhost", // ssh tunnel
      port: 9999,
      network_id: "1",
      gas: 3000000,
      gasPrice: 1000000007 // ~1 Gwei (I like primes)
    }
  }
};
