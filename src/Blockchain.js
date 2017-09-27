import Web3 from 'web3';
import ContractMetadata from './_P4PContract'

let instance = null;
let web3 = null;

/** Singleton class with methods for interacting with the P4P contract
 * Can be configured through the environment vars: ETH_NODE, ETH_ACCOUNT, ETH_P4P_ADDR, ETH_GASPRICE_GWEI
 */
class Blockchain {

  /* PUBLIC INTERFACE */

  /**
   * Instantiates this class. Returns a Singleton.
   * @param initializedCallback will be invoked once the smart contract was initialized.
   */
  constructor(initializedCallback) {
    if(!instance) {
      this.contractMetadata = ContractMetadata;
      this.contractInitialized = false;

      // doesn't support https. But nothing secret should be transferred anyway
      // beware: even if this passes without error we can't be sure to have a working connection
      web3 = new Web3(process.env.ETH_NODE || Web3.givenProvider);

      this.ethInit(
        process.env.ETH_ACCOUNT || this.guessDefaultAccount(),
        process.env.ETH_P4P_ADDR || this.guessContractAddress(),
        process.env.ETH_GASPRICE_GWEI * 1E9 || 4 * 1E9 // default: 4 gwei ("Standard" on http://ethgasstation.info/ at the moment)
      ).then(initializedCallback);

      instance = this;
    }
    return instance;
  }

  /** @returns true if there's a working connection to the Blockchain and the contract was successfully initialized */
  isInitialized() {
    return this.contractInitialized;
  }

  getGameHash(gameData) {
    return web3.utils.sha3(web3.utils.toHex(gameData));
  }

  isSignatureValid(address, sig) {
    // TODO: this broke down for unknown reason. Now throws
    // web3.min.js:1 Uncaught TypeError: Cannot read property 'slice' of undefined at Object.slice (web3.min.js:1)
    return web3.eth.accounts.recover(sig) == address;
  }

  /**
   * @param gameData an object representing the final state of the game. Should include all proposed moves, ideally with signatures.
   * @param tokenReceivers represents players entitled to PLAY tokens based on the last game.
   * Must be an array of maps containing "address" and "amount" where address is a hex string and amount an uint8.
   * @param callback (optional) will be invoked when the transaction was mined. If the callback never arrives, something went wrong.
   * Will be invoked with the transaction hash as first parameter and a bool which signals if execution was successful as second parameter.
   * @returns the game hash if the parameters were ok and the needed transactions were created and sent, null otherwise.
   * A non-null return value does NOT guarantee correct execution on the Blockchain (use the callback to check that).
   */
  persistGame(gameData, tokenReceivers, callback) {
    const gameHash = this.getGameHash(gameData);
    const startTs = Date.now();

    // educated worst case guess which acts as upper (safety) limit
    // that is because if the call throws, estimateGas() will return a wrong (much too high) value
    // so this is basically for checking if the transaction is going to succeed
    const gasReasonableLimit = 100000 + 50000*tokenReceivers.length;

    const addresses = tokenReceivers.map(e => e.address);
    const amounts = tokenReceivers.map(e => e.amount);

    // check if we got valid params
    if(addresses.length !== tokenReceivers.length || amounts.length != tokenReceivers.length
      || amounts.filter(e => isNaN(e) || e >= 1<<8 || e == 0).length != 0
      || addresses.filter(e => ! web3.utils.isAddress(e)).length != 0) {
      console.error(`Malformed parameter tokenReceivers`);
      return null;
    }

    // TODO: add game end state bitmap
    const boardBitmap = "0x0000000000000000000000000000000000000000000000000000000000000000";
    this.contract.methods.gamePlayed(gameHash, boardBitmap, addresses, amounts).estimateGas().then( gasEstimate => {
      let gasLimit = gasEstimate + Math.round(gasEstimate * 0.1); // estimate + 10%
      if(gasLimit > gasReasonableLimit) {
        /* Something may be wrong here (e.g. contract exception, see https://ethereum.stackexchange.com/a/8093/4298), thus interrupting */
        console.error(`Gas cost error: estimate based limit ${gasLimit} exceeds reasonable limit of ${gasReasonableLimit}. Manual investigation needed!`);
        return null;
      }
      if(gasLimit > this.maxGasPerTx) {


        // TODO: split into multiple transactions
        console.error(`Transaction larger than allowed. I can't yet handle as many tokenReceivers without batching (not yet implemented)!`);
        return null;
      }

      console.log(`sending tx for gamePlayed() with params:
            ${gameHash},
            ${boardBitmap},
            ${addresses},
            ${amounts}`);
      this.contract.methods.gamePlayed(gameHash, boardBitmap, addresses, amounts).send({gas: gasLimit})
        .once('transactionHash', txHash => {
          console.log(`tx ${txHash} sent: gamePlayed with ${tokenReceivers.length} token receivers, gas limit set to ${gasLimit}`)
        }).once('receipt', receipt => {
        //console.log(`receipt: ${JSON.stringify(receipt)}`);
        const runtime = Math.floor((Date.now() - startTs) / 1000);
        const txCost = this.contract.options.gasPrice * receipt.gasUsed / 1E15; // in finney (milliEther)
        // success can be guessed (with high probability) by checking gasUsed. See https://ethereum.stackexchange.com/questions/6007/how-can-the-transaction-status-from-a-thrown-error-be-detected-when-gas-can-be-e
        const success = receipt.gasUsed < gasLimit ? true : false;
        if(! success) {
          console.error(`tx ${receipt.transactionHash} seems to have failed (all gas used)`);
        }
        console.log(`tx ${receipt.transactionHash} done: after ${runtime} seconds in block ${receipt.blockNumber} consuming ${receipt.gasUsed} gas - paid ${txCost.toFixed(2)} finney`);
        if(callback) {
          callback(receipt.transactionHash, success);
        }
      }).on('confirmation', (confirmationNumber, receipt) => {
        //console.log(`confirmation: ${confirmationNumber}`);
      }).on('error', console.error);
    });
    return gameHash;
  }

  /* END OF PUBLIC INTERFACE */

  guessContractAddress() {
    console.log(`No contract address set, guessing from truffle generated metadata...`);
    // in case of multiple network entries, the last seems to be a safe bet
    let address = null;
    for(let networkId in this.contractMetadata.networks) {
      address = this.contractMetadata.networks[networkId].address;
      console.log(`guessed: ${this.contractMetadata.networks[networkId]}`);
    }
    return address;
  }

  // @returns a promise for the default account
  guessDefaultAccount() {
    console.log(`No account set, guessing...`);
    // would be nice to have await/async here...
    return new Promise( (resolve, reject) => {
      web3.eth.getAccounts().then( accs => {
        console.log(`available accounts: ${accs} - picking the first!`);
        resolve(accs[0]);
      });
    });
  }

  /** @param defaultAccount can be a promise */
  ethInit(defaultAccount, contractAddress, gasPrice) {
    return new Promise( (resolve, reject) => {
      const addr = contractAddress;
      console.log(`initializing contract at address ${addr}`)
      this.contract = new web3.eth.Contract(this.contractMetadata.abi, addr);
      console.log('contract initialized')

      // Retrieve the token address. This also tests if we have a working connection and contract instance
      this.contract.methods.getTokenAddress().call().then(tokenAddr => {
        console.log(`token address is ${tokenAddr}`);
        this.tokenAddress = tokenAddr;
        resolve();
      });

      Promise.resolve(defaultAccount).then( acc => {
        this.contract.options.from = acc;
      });

      web3.eth.getBlock("latest").then( block => {
        /* This is a guess about what's a safe value for max gas limit per TX.
        Shouldn't be too high (risk: tx remains in pool if not offering elevated gas price)
        or too low (need to split up work into many transactions when there's many players) */
        this.maxGasPerTx = block.gasLimit / 2;
      })
      if(gasPrice != null) {
        console.log(`setting gasPrice to ${gasPrice / 1E9} GWei`);
        this.contract.options.gasPrice = gasPrice;
      }
    });
  }

  get web3() {
    return web3;
  }
}

export default Blockchain;