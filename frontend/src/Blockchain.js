import Web3 from 'web3';
import * as crypto from 'crypto'; // TODO: if needed only for random bytes, ditch!
import ethUtil from 'ethereumjs-util'; // used for signature creation
// TODO: this triggers an ugly warning: "There are multiple modules with names that only differ in casing"
import Buffer from 'Buffer';

class Blockchain {
    constructor() {
        this.ethInit();
        this.cryptoUtil = crypto;
        this.Buffer = Buffer;
        this.ethUtil = ethUtil;
    }

    ethInit() {
        // doesn't support https. But nothing secret should be transferred anyway
        // TODO: make the node URL configurable
        this.web3 = new Web3(Web3.givenProvider || "http://rinkeby.eth.lab10.io");

        // TODO: if an account is provided by the browser, use it
    }

    createAccount(username) {
        const privKey = this.createRandomPrivateKey(username);
        const account = this.web3.eth.accounts.privateKeyToAccount(privKey);
        console.log(`created ad hoc account: ${account.address}`);
        return account;
    }

    // generates a private key by concatenating the username and a random string (32 bytes entropy (?)) 5000 times and taking the sha3 of it
    // implementation as suggested here: https://www.reddit.com/r/ethereum/comments/535ovp/is_there_a_javascript_library_for_generating/d7q8hq7/
    createRandomPrivateKey(username) {
        const randomStr = this.cryptoUtil.randomBytes(32).toString('hex');
        const inputStr = Array(5000).join(username + ":" + randomStr);
        return this.web3.utils.sha3(inputStr);
    }

    // to download this as a file, do something like: https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
    createEncryptedKeystore(privKey, password) {
        return this.web3.eth.accounts.encrypt(privKey, password);
    }

    // TODO: are this conversions to a Buffer object correct?
    signMessage(msg, privKey) {
        const msgBuf = this.Buffer(this.web3.utils.hexToBytes(this.web3.utils.sha3(msg)));
        const privKeyBuf = this.Buffer(this.web3.utils.hexToBytes(privKey));
        return this.ethUtil.ecsign(msgBuf, privKeyBuf);
    }
}

export default Blockchain;