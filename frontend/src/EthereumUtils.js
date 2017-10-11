// TODO: switch back to module once this is solved: https://github.com/ethereum/web3.js/issues/977
//import Web3 from 'web3';
import gs from './GameSettings'

let instance = null;
let web3;

let debug = gs.inDebugMode();

let log = debug ? (msg) => { console.log(`EthereumUtils: ${msg}`) } : () => {};
let err = debug ? (msg) => { console.error(`ERROR in EthereumUtils: ${msg}`) } :  () => {};

/** Singleton class with functionality needed for Ethereum-unaware browsers */
class EthereumUtils {

  /* PUBLIC INTERFACE */

  /** @returns an instance of this class */
  constructor() {
    if (!instance) {
      log("creating new instance");
      // givenProvider will be null in non-Ethereum browsers. The functionaly we need works anyway.
      web3 = new window.Web3(window.Web3.givenProvider);
      this.loadWallet();
      instance = this;
    }
    if(debug) {
      window.web3 = web3;
      window.ethUtils = this;
    }
    return instance;
  }

  /** creates a new wallet
   * To be invoked only in order to override (and lose if not persisted elsewhere) the existing one.
   */
  createNewWallet() {
    // making sure the user isn't bothered with a password prompt.
    // Can happen after forgetting the password for a wallet, accepting to create a new one and not persisting it.
    localStorage.removeItem('web3js_wallet');
    this.loadWallet(true);
  }

  unlockWallet(password) {
    try {
      this.wallet = web3.eth.accounts.wallet.load(password);
      if(this.wallet.length === 0) {
        err(`There's no wallet stored we could unlock`);
        throw new Error("No wallet stored");
      }
      this.wallet.persisted = true;
      this.wallet.locked = false;
      sessionStorage.setItem("wallet", JSON.stringify(this.wallet.encrypt("passwordForIntermediateStorage")));
      sessionStorage.setItem("walletPersisted", this.wallet.persisted);
      return this.getAddress();
    } catch (e) {
      err(`dude, that password sucks!`);
      return null;
    }
  }

  /** @returns the address of the first account of the loaded wallet. A wallet needs to be loaded first! */
  getAddress() {
    if(this.wallet) {
      // if a locked wallet is loaded from localStorage, the address is formatted differently then when loaded unlocked via web3.
      if(this.wallet.locked) {
        return `0x${this.wallet[0].address.toLowerCase()}`
      } else {
        return this.wallet[0].address.toLowerCase();
      }
    } else {
      return null; // shouldn't be possible
    }
  }

  /** Saves the wallet in the browser (localStorage), protected by the given password */
  persistWallet(password) {
    if(! this.wallet || this.wallet.length === 0) {
      throw new Error("no suitable wallet loaded");
    }
    log(`persistWallet with pass ${password}`);
    this.wallet.save(password);
    this.wallet.persisted = true;
    // for caller's convenience, we keep the password in memory
    this.password = password;
  }

  needsUnlock() {
    return this.wallet.locked;
  }

  needsPersist() {
    if(this.wallet && ! this.wallet.persisted) {
      return true;
    } else {
      return false;
    }
  }

  updateDownloadLink(linkElement, password) {
    if(this.wallet === null) {
      throw new Error("no wallet loaded");
    }
    const json = JSON.stringify(this.getEncryptedKeystore(password));
    const blob = new Blob([json], {type: "application/json"});
    const url  = URL.createObjectURL(blob);

    //var a = document.createElement('a');
    linkElement.download    = "play_wallet.json";
    linkElement.href        = url;

    return linkElement;
  }

  /**
   * @param password if null it falls back to the password previously used with persistWallet().
   * @returns an encrypted keystore object as specified by https://github.com/ethereum/wiki/wiki/Web3-Secret-Storage-Definition
   */
  getEncryptedKeystore(password) {
    // we're interested only in the first account in the keystore.
    // That's also what e.g. MyEtherWallet expects (it doesn't recognize an array of accounts)
    return this.wallet ? this.wallet.encrypt(password || this.password)[0] : null;
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

  /** deletes local and stored wallet object. For debugging convenience. */
  reset() {
    this.wallet = undefined;
    sessionStorage.removeItem("wallet");
    localStorage.removeItem("web3js_wallet");
  }

  /**
   * Loads an Ethereum wallet if exists, creates a new one with a single account otherwise.
   * @param forceNew if true a new wallet will be created even if one already exists (in localStorage)
   * @returns an address from the loaded wallet or null if loading the wallet failed.
   * If the loaded wallet is password protected, it needs to be unlocked. Check with needsUnlock()!
   */
  loadWallet(forceNew) {
    if(! forceNew) {
      // first, lets see if we have a session wallet. Using the same key web3 uses for localStorage.
      const sessionWallet = sessionStorage.getItem("wallet");
      if (sessionWallet) {
        // we're not really interested in encrypting this, but that seems the easiest way to serialize it for storage
        this.wallet = web3.eth.accounts.wallet.decrypt(JSON.parse(sessionWallet), "passwordForIntermediateStorage");
        // the persist flag is lost when encrypting / decrypting, thus handling it manually.
        this.wallet.persisted = (sessionStorage.getItem("walletPersisted") === "true");
        this.wallet.locked = false;
        log("loaded wallet from sessionStorage");
        return this.getAddress();
      } else {
        try {
          // No session wallet found. Now lets see if a wallet was persisted in another session
          // This will return an empty wallet if nothing is stored and throw an exception (password missing) if a wallet is stored.
          // This is not documented behaviour, thus needs to be checked when updating web3.
          // http://web3js.readthedocs.io/en/1.0/web3-eth-accounts.html#wallet-load
          web3.eth.accounts.wallet.load();
          // Thus if neither an Exception was thrown nor forceNew set, we will just proceed with a new wallet (after catch block).
        } catch (e) {
          // A wallet is stored and needs a password
          log(`There seems to be a previously stored wallet available, needs password to load`);

          try {
            // Manually retrieving address. If something isn't as expected, return null
            this.wallet = JSON.parse(localStorage.getItem('web3js_wallet'));
            this.wallet.locked = true;
            return this.getAddress();
          } catch(e) {
            return null;
          }
        }
      }
    }

    // If we got here, a new wallet is needed
    log(`Creating new wallet`);
    this.wallet = web3.eth.accounts.wallet.create(1);
    this.wallet.persisted = false;
    this.wallet.locked = false;
    log(`New wallet - Address: ${this.getAddress()}`);
    // saving to sessionStorage in order to have it available on other pages
    sessionStorage.setItem("wallet", JSON.stringify(this.wallet.encrypt("passwordForIntermediateStorage")));
    sessionStorage.setItem("walletPersisted", this.wallet.persisted);
    return this.getAddress();
  }
}

export default new EthereumUtils();