import Web3 from 'web3';

let web3 = null;
let instance = null;

/** Lightweight provider of Ethereum-style signature checking and hashing */
class EthCrypto {
  constructor() {
    if (!instance) {
      instance = this;
      // we need no connection to a node here. This is just to get a web3 instance
      web3 = new Web3(Web3.givenProvider);
    }
    return instance;
  }

  static hash(data) {
    return web3.utils.sha3(web3.utils.toHex(data));
  }

  static isSignatureValid(address, sigData, sig) {
    return web3.eth.accounts.recover(sigData, sig).toLowerCase() === address.toLowerCase();
  }
}

export default new EthCrypto();
