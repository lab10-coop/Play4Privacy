import Web3 from 'web3';
import * as crypto from 'crypto'; // TODO: if needed only for random bytes, ditch!
import ethUtil from 'ethereumjs-util'; // used for signature creation
// TODO: this triggers an ugly warning: "There are multiple modules with names that only differ in casing"
import Buffer from 'Buffer';

let instance = null;

/** Singleton class with functionality needed for Ethereum-unaware browsers */
class EthereumUtils {

    /* PUBLIC INTERFACE */

    /** @returns an instance of this class */
    constructor() {
        if (!instance) {
            this.cryptoUtil = crypto;
            this.Buffer = Buffer;
            this.ethUtil = ethUtil;
            // givenProvider will be null in non-Ethereum browsers. The functionaly we need works anyway.
            this.web3 = new Web3(Web3.givenProvider);

            instance = this;
        }
        return instance;
    }

    /**
     * Creates an Ethereum account
     * @param username is used as additional entropy
     * @returns an object representing the account
     *
     * Do NOT leak this object anywhere, because it contains the private key.
     */
    createAccount(username) {
        const privKey = this.createRandomPrivateKey(username);
        const account = this.web3.eth.accounts.privateKeyToAccount(privKey);
        console.log(`created ad hoc account: ${account.address}`);
        return account;
    }

    /** @returns an encrypted keystore object as specified by https://github.com/ethereum/wiki/wiki/Web3-Secret-Storage-Definition */
    createEncryptedKeystore(privKey, password) {
        // fortunately web3 1.0 added the possibility to create keystore objects. This considerably reduces required code size here.
        return this.web3.eth.accounts.encrypt(privKey, password);
    }

    /**
     * Signs a message (ECDSA)
     * @param message String
     * @param account object representing an Ethereum account
     * @returns a signature object {r, s, v}
     *
     * TODO: this should probably return the signature in a more useful format, e.g. as JSON Web Signature
     */
    signMessage(message, account) {
        return this.internalSignMessage(message, account.privateKey);
    }

    /* END OF PUBLIC INTERFACE */

    // generates a private key by concatenating the username and a random string (32 bytes entropy (?)) 5000 times and taking the sha3 of it
    // implementation as suggested here: https://www.reddit.com/r/ethereum/comments/535ovp/is_there_a_javascript_library_for_generating/d7q8hq7/
    createRandomPrivateKey(username) {
        const randomStr = this.cryptoUtil.randomBytes(32).toString('hex');
        const inputStr = Array(5000).join(username + ":" + randomStr);
        return this.web3.utils.sha3(inputStr);
    }

    // uses web3 and ethereumjs-util to first hash the message and then create a signature for it
    /* TODO: web3 1.0 seems to have everything needed to generate signed Eth transactions without interacting with the node. Check that! */
    internalSignMessage(msg, privKey) {
        // TODO: are this conversions to a Buffer object correct?
        const msgBuf = this.Buffer(this.web3.utils.hexToBytes(this.web3.utils.sha3(msg)));
        const privKeyBuf = this.Buffer(this.web3.utils.hexToBytes(privKey));
        return this.ethUtil.ecsign(msgBuf, privKeyBuf);
    }
}

export default EthereumUtils;