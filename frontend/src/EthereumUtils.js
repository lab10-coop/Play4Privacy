// TODO: switch back to module once this is solved: https://github.com/ethereum/web3.js/issues/977
//import Web3 from 'web3';

let instance = null;
let web3;

/** Singleton class with functionality needed for Ethereum-unaware browsers */
class EthereumUtils {

    /* PUBLIC INTERFACE */

    /** @returns an instance of this class */
    constructor() {
        if (!instance) {
            // givenProvider will be null in non-Ethereum browsers. The functionaly we need works anyway.
            web3 = new window.Web3(window.Web3.givenProvider);

            instance = this;
        }
        return instance;
    }

    /**
     * Loads an Ethereum wallet if exists, creates a new one with a single account otherwise.
     * @param forceNew if true a new wallet will be created even if one already exists (in localStorage)
     * @returns the address of the first account in the wallet
     */
    loadWallet(forceNew) {
        if(! forceNew) {
            // try to load an existing wallet. See http://web3js.readthedocs.io/en/1.0/web3-eth-accounts.html#wallet-load
            try {
                // This will return an empty wallet if nothing is stored and throw an exception (password missing) if a wallet is stored.
                // This is not documented behaviour, but was determined by testing.
                this.wallet = web3.eth.accounts.wallet.load();
            } catch (e) {
                // A wallet is stored and needs a password
                console.log(`There seems to be a previously stored wallet available, needs password to load`);
                // TODO: retrieve password from user
                try {
                    // Mahrer mode: hardcoded password. TODO: remove
                    this.wallet = web3.eth.accounts.wallet.load("FckingDifficultPasswordForMahrerDemo");
                    return this.getAddress();
                } catch (e) {
                    console.error(`dude, that password sucks!`)
                }
            }
        }

        // If we got here, a new wallet is needed
        console.log(`Creating new wallet`);
        this.wallet = web3.eth.accounts.wallet.create(1);
        console.log(`Address: ${this.getAddress()}`);
        return this.getAddress();
    }

    /** @returns the address of the first account of the loaded wallet. A wallet needs to be loaded first! */
    getAddress() {
        return this.wallet ? this.wallet[0].address : null;
    }

    /** Saves the wallet in the browser (localStorage), locked with the given password */
    persistWallet(password) {
        web3.eth.accounts.wallet.save(password);
    }

    /** @returns an encrypted keystore object as specified by https://github.com/ethereum/wiki/wiki/Web3-Secret-Storage-Definition */
    createEncryptedKeystore(password) {
        return this.wallet ? this.wallet.encrypt(password) : null;
    }

    /** Signs the given data with the loaded account
     * @param data arbitrary data
     * @returns the signature as hex string
     */
    sign(data) {
        return this.wallet ? web3.eth.accounts.sign(data, this.wallet[0].privateKey).signature : null;
    }

    /* END OF PUBLIC INTERFACE */

    get web3() {
        return web3;
    }
}

export default new EthereumUtils();