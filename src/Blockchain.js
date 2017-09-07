import Web3 from 'web3';
import ContractMetadata from './_P4PContract'

let instance = null;
let web3 = null;

/** Singleton class with methods for interacting with the P4P contract */
class Blockchain {

    /* PUBLIC INTERFACE */

    /**
     * Instantiates this class. Only one instance allowed.
     * @param fallbackNode URL of Ethereum node to which a connection should be established if none is provided by the Browser.
     * Falls back to a lab10 Rinkeby node if null.
     * @param contractAddress address of the P4P contract. Falls back to internal discovery if null.
     * @param initializedCallback will be invoked once the smart contract was initialized.
     */
    constructor(fallbackNode, defaultAccount, contractAddress, initializedCallback) {
        if(!instance) {
            this.contractMetadata = ContractMetadata;
            this.contractInitialized = false;

            // doesn't support https. But nothing secret should be transferred anyway
            // beware: even if this passes without error we can't be sure to have a working connection
            web3 = new Web3(Web3.givenProvider || (fallbackNode != null ? fallbackNode : "http://rinkeby.eth.lab10.io"));

            this.ethInit(
                defaultAccount != null ? defaultAccount : this.guessDefaultAccount(),
                contractAddress != null ? contractAddress : this.guessContractAddress(),
                4000000000 // 4 gwei ("Standard" on http://ethgasstation.info/ at the moment)
            ).then(initializedCallback);

            instance = this;
        }
        return instance;
    }

    /** @returns true if there's a working connection to the Blockchain and the contract was successfully initialized */
    isInitialized() {
        return this.contractInitialized;
    }

    /**
     * @param gameData an object representing the final state of the game. Should include all proposed moves, ideally with signatures.
     * @param tokenReceivers an array of addresses (hex strings) of players entitled to PLAY tokens based on the given game round.
     * @param callback will be invoked when the transaction gets confirmed
     * @returns TODO
     */
    persistGame(gameData, tokenReceivers, callback) {
        const gameHash = web3.utils.sha3(web3.utils.toHex(gameData));
        const startTs = Date.now();

        // educated worst case guess which acts as upper (safety) limit
        const gasUpperLimit = 100000 + 35000*tokenReceivers.length;

        this.contract.methods.gamePlayed(gameHash, tokenReceivers).estimateGas().then( gasEstimate => {
            const gasLimit = gasEstimate + Math.round(gasEstimate * 0.1); // estimate + 10%
            if(gasLimit > gasUpperLimit) {
                /* Something may be wrong here (e.g. contract exception, see https://ethereum.stackexchange.com/a/8093/4298), thus interrupting */
                throw(`Gas cost error: estimate based limit (${gasLimit}) exceeds upper limit (${gasUpperLimit}). Manual investigation needed!`);
            }
            if(gasLimit > this.maxGasPerTx) {
                // TODO: split into multiple transactions
            }

            this.contract.methods.gamePlayed(gameHash, tokenReceivers).send({gas: gasLimit}, (err, txHash) => {
                console.log(`tx ${txHash} sent: persistGame with ${tokenReceivers.length} token receivers, gas limit set to ${gasLimit}`)
                return txHash;
            }).then( receipt => {
                const runtime = Math.floor((Date.now() - startTs) / 1000);
                const txCost = this.contract.options.gasPrice * receipt.gasUsed / 1E15; // in finney (milliEther)
                console.log(`tx ${receipt.transactionHash} done: after ${runtime} seconds in block ${receipt.blockNumber} consuming ${receipt.gasUsed} gas - paid ${txCost.toFixed(2)} finney`);
            });
        });
    }

    /* END OF PUBLIC INTERFACE */

    guessContractAddress() {
        // in case of multiple network entries, the last seems to be a safe bet
        let address = null;
        for(let networkId in this.contractMetadata.networks) {
            //console.log(contract.networks[networkId])
            address = this.contractMetadata.networks[networkId].address;
        }
        return address;
    }

    // @returns a promise for the default account
    guessDefaultAccount() {
        // would be nice to have await/async here...
        return new Promise( (resolve, reject) => {
            web3.eth.getAccounts().then( accs => {
                console.log("accounts: " + accs)
                resolve(accs[0]);
            });
        });
    }

    /** @param defaultAccount can be a promise */
    ethInit(defaultAccount, contractAddress, gasPrice) {
        return new Promise( (resolve, reject) => {
            // TODO: if an account is provided by the browser, use it

            const addr = contractAddress;
            console.log(`initializing contract at address ${addr}`)
            this.contract = new web3.eth.Contract(this.contractMetadata.abi, addr);
            console.log('contract initialized')

            // this also tests if we have a working connection and contract instance
            this.contract.methods.getTokenAddress().call().then(tokenAddr => {
                console.log(`token address is ${addr}`);
                this.tokenAddress = tokenAddr;
                resolve();
            })

            Promise.resolve(defaultAccount).then( acc => {
                this.contract.options.from = acc;
            });

            web3.eth.getBlock("latest").then( block => {
                /* This is a guess about what's a safe value for max gas limit per TX.
                Shouldn't be too high (risk: tx remains in pool if not offering elevated gas price)
                or too low (need to split up work into many transactions when there's many players) */
                this.maxGasPerTx = block.gasLimit / 4;
            })
            this.contract.options.gasPrice = gasPrice;
        });
    }

    get web3() {
        return web3;
    }
}

export default Blockchain;