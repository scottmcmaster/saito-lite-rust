import Peer from "./peer";

const getUuid = require("uuid-by-string");
const ModalSelectCrypto = require("./ui/modals/select-crypto/select-crypto");
import Transaction from "./transaction";
import Slip from "./slip";
import { Saito } from "../../apps/core";
import S from "saito-js/saito";
import SaitoWallet from "saito-js/lib/wallet";
import BalanceSnapshot from "saito-js/lib/balance_snapshot";
import { WalletSlip } from "saito-js/lib/wallet";

const CryptoModule = require("../templates/cryptomodule");

export default class Wallet extends SaitoWallet {
  public app: Saito;

  publicKey;

  preferred_crypto = "SAITO";
  preferred_txs = [];

  default_fee = 0;

  version = 5.466;

  cryptos = new Map<string, any>();
  public saitoCrypto: any;

  public async createUnsignedTransactionWithDefaultFee(
    publicKey = "",
    amount = BigInt(0)
  ): Promise<Transaction> {
    if (publicKey == "") {
      publicKey = await this.getPublicKey();
    }
    return this.createUnsignedTransaction(publicKey, amount, BigInt(0));
  }

  public async createUnsignedTransaction(
    publicKey = "",
    amount = BigInt(0),
    fee = BigInt(0),
    force_merge = false
  ): Promise<Transaction> {
    if (publicKey == "") {
      publicKey = await this.getPublicKey();
    }
    return S.getInstance().createTransaction(publicKey, amount, fee, force_merge);
  }

  public async getBalance(ticker = "SAITO"): Promise<bigint> {
    if (ticker === "SAITO") {
      return this.instance.get_balance();
    }
    return BigInt(0);
  }

  async initialize() {
    console.log("wallet.initialize");

    let privateKey = await this.getPrivateKey();
    let publicKey = await this.getPublicKey();
    this.publicKey = publicKey;
    console.log("public key = " + publicKey, " / private key ? " + (privateKey !== ""));

    // add ghost crypto module so Saito interface available
    class SaitoCrypto extends CryptoModule {
      constructor(app) {
        super(app, "SAITO");
        this.name = "Saito";
        this.description = "Saito";
        this.balance = "0.0";
        this.publicKey = publicKey;
        this.destination = publicKey;
      }

      async returnBalance() {
        return parseFloat(await this.app.wallet.getBalance());
      }

      returnAddress() {
        return this.publicKey;
      }

      returnPrivateKey() {
        return this.app.wallet.getPrivateKey();
      }

      returnWithdrawalFeeForAddress(address = "", mycallback = null) {
        if (mycallback) {
          mycallback(0);
        }
      }

      returnHistory(asset_id = "", records = 20, callback = null) {
        // to be implemented in future
        // redirecting users to block explorer for now
      }

      async sendPayment(amount, to_address, unique_hash = "") {
        let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(
          to_address,
          BigInt(amount)
        );
        await this.app.wallet.signAndEncryptTransaction(newtx);
        await this.app.network.propagateTransaction(newtx);
        return newtx.signature;
      }

      async receivePayment(howMuch, from, to, timestamp) {
        const from_from = 0;
        const to_to = 0;
        if (to == (await this.app.wallet.getPublicKey())) {
          for (let i = 0; i < this.app.wallet.instance.inputs.length; i++) {
            if (this.app.wallet.instance.inputs[i].amount === howMuch) {
              if (parseInt(this.app.wallet.instance.inputs[i].timestamp) >= parseInt(timestamp)) {
                if (this.app.wallet.instance.inputs[i].publicKey == to) {
                  return true;
                }
              }
            }
          }
          for (let i = 0; i < this.app.wallet.instance.outputs.length; i++) {
            if (this.app.wallet.instance.outputs[i].amount === howMuch) {
              if (parseInt(this.app.wallet.instance.outputs[i].timestamp) >= parseInt(timestamp)) {
                if (this.app.wallet.instance.outputs[i].publicKey == to) {
                  return true;
                }
              }
            }
          }
          return false;
        } else {
          if (from == (await this.app.wallet.getPublicKey())) {
            for (let i = 0; i < this.app.wallet.instance.outputs.length; i++) {
              //console.log("OUTPUT");
              //console.log(this.app.wallet.instance.outputs[i]);
              if (this.app.wallet.instance.outputs[i].amount === howMuch) {
                if (
                  parseInt(this.app.wallet.instance.outputs[i].timestamp) >= parseInt(timestamp)
                ) {
                  if (this.app.wallet.instance.outputs[i].publicKey == to) {
                    return true;
                  }
                }
              }
            }
          }
          return false;
        }
      }

      returnIsActivated() {
        return true;
      }

      onIsActivated() {
        return new Promise((resolve, reject) => {
          resolve(null);
        });
      }
    }


    this.saitoCrypto = new SaitoCrypto(this.app);

    if (this.app.options.wallet != null) {
      /////////////
      // upgrade //
      /////////////
      if (this.app.options.wallet.version < this.version) {
        if (this.app.BROWSER === 1) {
          console.log("upgrading wallet version to : " + this.version);
          let tmpprivkey = this.app.options.wallet.privateKey;
          let tmppubkey = this.app.options.wallet.publicKey;

          //
          // Note: since WASM switch over, we use camelCasing for the keys
          // These are two checks to make sure outdated wallets are still compatible
          //
          if (this.app.options.wallet.privatekey) {
            tmpprivkey = this.app.options.wallet.privatekey;
          }

          if (this.app.options.wallet.publickey) {
            tmppubkey = this.app.options.wallet.publickey;
          }

          let mixin = this.app.options.mixin;
          let crypto = this.app.options.crypto;

          // save contacts(keys)
          let keys = this.app.options.keys;
          let chats = this.app.options.chat;
          let leagues = this.app.options.leagues;

          // save theme options
          let theme = this.app.options.theme;

          // keep user's game preferences
          let gameprefs = this.app.options.gameprefs;

          // specify before reset to avoid archives reset problem
          await this.setPrivateKey(tmpprivkey);
          await this.setPublicKey(tmppubkey);

          // let modules purge stuff
          await this.app.modules.onWalletReset();

          // reset and save
          await this.app.storage.resetOptions();
          await this.instance.reset();
          await this.app.blockchain.resetBlockchain();
          // this.app.storage.saveOptions();

          // re-specify after reset
          await this.setPrivateKey(tmpprivkey);
          await this.setPublicKey(tmppubkey);

          // this.app.options.wallet = this.wallet;
          this.app.options.wallet.preferred_crypto = this.preferred_crypto;
          this.app.options.wallet.preferred_txs = this.preferred_txs;
          this.app.options.wallet.version = this.version;
          this.app.options.wallet.default_fee = this.default_fee;
          // this.app.options.wallet.slips = [];

          if (this.app.options.wallet.slips) {
            let slips = this.app.options.wallet.slips.map((json: any) => {
              let slip = new WalletSlip();
              slip.copyFrom(json);
              return slip;
            });
            await this.addSlips(slips);
          }
          // reset games and restore game settings
          this.app.options.games = [];
          this.app.options.gameprefs = gameprefs;

          // keep mixin
          this.app.options.mixin = mixin;
          this.app.options.crypto = crypto;

          // keep contacts (keys)
          this.app.options.keys = keys;
          this.app.options.chat = chats;
          this.app.options.leagues = leagues;

          // keep theme
          this.app.options.theme = theme;

          await this.saveWallet();

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          alert("Saito Upgrade: Wallet Reset");
          // window.location.reload();
        } else {
          // purge old slips
          this.app.options.wallet.version = this.version;
          this.app.options.wallet.slips = [];

          this.app.storage.saveOptions();
        }
      } else {
        if (typeof this.app.options.wallet.preferred_crypto != "undefined") {
          this.preferred_crypto = this.app.options.wallet.preferred_crypto;
        }
        if (this.app.options.wallet.slips) {
          let slips = this.app.options.wallet.slips.map((json: any) => {
            let slip = new WalletSlip();
            slip.copyFrom(json);
            return slip;
          });
          await this.addSlips(slips);
        }
      }

      this.app.connection.on("wallet-updated", async () => {
        await this.saveWallet();
      });

      // this.instance = Object.assign(this.instance, this.app.options.wallet);
    }
    ////////////////
    // new wallet //
    ////////////////
    if (!privateKey || !publicKey) {
      await this.resetWallet();
    }
  }

  constructor(wallet: any) {
    super(wallet);

    this.saitoCrypto = null;

    // this.recreate_pending_transactions = 0;
  }

  /**
   * Generates a new keypair for the user, resets all stored wallet info, and saves
   * the new wallet to local storage.
   */
  async resetWallet() {
    console.log("resetting wallet : " + (await this.getPublicKey()));
    // await S.getInstance().resetWallet();
    await this.app.storage.resetOptions();

    await this.reset();

    if (this.app.options.blockchain) {
      await this.app.blockchain.resetBlockchain();
    }

    // keychain
    if (this.app.options.keys) {
      this.app.options.keys = [];
    }

    // let modules purge stuff (not implementer)
    await this.app.modules.onWalletReset(true);

    await this.saveWallet();

    this.app.options.invites = [];
    this.app.options.games = [];
    this.app.storage.saveOptions();

    console.log("new wallet : " + (await this.getPublicKey()));

    if (this.app.browser.browser_active == 1) {
      window.location.reload();
    }
  }

  /**
   * Saves the current wallet state to local storage.
   */
  async saveWallet() {
    if (!this.app.options.wallet) {
      this.app.options.wallet = {};
    }
    this.app.options.wallet.preferred_crypto = this.preferred_crypto;
    this.app.options.wallet.preferred_txs = this.preferred_txs;
    this.app.options.wallet.version = this.version;
    this.app.options.wallet.default_fee = this.default_fee;
    let slips = await this.getSlips();

    this.app.options.wallet.slips = slips.map((slip) => slip.toJson());

    await this.save();
    this.app.storage.saveOptions();
  }

  /////////////////////////
  // WEB3 CRYPTO MODULES //
  /////////////////////////

  returnInstalledCryptos() {
    const cryptoModules = this.app.modules.returnModulesBySubType(CryptoModule);
    if (this.saitoCrypto !== null) {
      cryptoModules.push(this.saitoCrypto);
    }
    return cryptoModules;
  }

  returnActivatedCryptos() {
    const allMods = this.returnInstalledCryptos();
    const activeMods = [];
    for (let i = 0; i < allMods.length; i++) {
      if (allMods[i].returnIsActivated()) {
        activeMods.push(allMods[i]);
      }
    }

    return activeMods;
  }

  returnCryptoModuleByTicker(ticker) {
    const mods = this.returnInstalledCryptos();
    for (let i = 0; i < mods.length; i++) {
      if (mods[i].ticker === ticker) {
        return mods[i];
      }
    }
    throw "Module Not Found: " + ticker;
  }

  setPreferredCrypto(ticker, show_overlay = 0) {
    let can_we_do_this = 0;
    const mods = this.returnInstalledCryptos();
    let cryptomod = null;

    for (let i = 0; i < mods.length; i++) {
      if (mods[i].ticker === ticker) {
        cryptomod = mods[i];
        can_we_do_this = 1;

        if (mods[i].options.isActivated == true) {
          show_overlay = 0;
        }
      }
    }

    if (can_we_do_this == 1) {
      this.preferred_crypto = ticker;
      console.log("Activating cryptomod: " + cryptomod.ticker);
      cryptomod.activate();
      //cryptomod.returnBalance();
      //await this.saveWallet();
    }

    return;
  }

  async returnPreferredCrypto() {
    try {
      return this.returnCryptoModuleByTicker(this.preferred_crypto);
    } catch (err) {
      if (err.startsWith("Module Not Found:")) {
        this.setPreferredCrypto("SAITO");
        return this.returnCryptoModuleByTicker(this.preferred_crypto);
      } else {
        throw err;
      }
    }
  }

  async returnPreferredCryptoTicker() {
    try {
      const pc = await this.returnPreferredCrypto();
      if (pc != null && pc != undefined) {
        return pc.ticker;
      }
    } catch (err) {
      return "";
    }
  }

  returnCryptoAddressByTicker(ticker = "SAITO") {
    try {
      if (ticker === "SAITO") {
        return this.publicKey;
      } else {
        const cmod = this.returnCryptoModuleByTicker(ticker);
        if (cmod) {
          return cmod.returnAddress();
        }
        console.log(`Crypto Module (${ticker}) not found`);
      }
    } catch (err) {
      console.error(err);
    }
    return "";
  }

  async returnAvailableCryptosAssociativeArray() {
    let cryptos = {};

    let ticker;
    try {
      let mods = this.returnActivatedCryptos();
      for (let i = 0; i < mods.length; i++) {
        ticker = mods[i].ticker;
        let address = mods[i].returnAddress();
        let balance = await mods[i].returnBalance();
        if (!cryptos[ticker]) {
          cryptos[ticker] = { address, balance };
        }

        if (parseFloat(balance) > 0) {
          mods[i].save();
        }
      }
    } catch (err) {
      console.error(err);
      console.log(ticker);
    }
    return cryptos;
  }

  async returnPreferredCryptoBalances(addresses = [], mycallback = null, ticker = "") {
    if (ticker == "") {
      ticker = this.preferred_crypto;
    }
    const cryptomod = this.returnCryptoModuleByTicker(ticker);
    const returnObj = [];
    const balancePromises = [];
    for (let i = 0; i < addresses.length; i++) {
      balancePromises.push(cryptomod.returnBalance(addresses[i]));
    }
    const balances = await Promise.all(balancePromises);
    for (let i = 0; i < addresses.length; i++) {
      returnObj.push({ address: addresses[i], balance: balances[i] });
    }
    if (mycallback != null) {
      mycallback(returnObj);
    }
    return returnObj;
  }

  savePreferredCryptoBalance(ticker, address, balance) {
    // if this is my address...
    let cryptomods = this.returnInstalledCryptos();
    for (let i = 0; i < cryptomods.length; i++) {
      if (cryptomods[i].ticker === ticker) {
        if (cryptomods[i].returnAddress() === address) {
          // cache the results, so i know if payments are new
          cryptomods[i].balance = balance;
          this.app.wallet.cryptos[ticker] = { address: address, balance: balance };
        }
      }
    }
  }

  /*** courtesy function to simplify balance checks for a single address w/ ticker ***/
  async checkBalance(address, ticker) {
    const robj = await this.returnPreferredCryptoBalances([address], null, ticker);
    if (robj.length < 1) {
      return 0;
    }
    if (robj[0].balance) {
      return robj[0].balance;
    }
    return 0;
  }

  async returnPreferredCryptoBalance() {
    const cryptomod = await this.returnPreferredCrypto();
    return await this.checkBalance(cryptomod.returnAddress(), cryptomod.ticker);
  }

  /**
   * Sends payments to the addresses provided if this user is the corresponding
   * sender. Will not send if similar payment was found after the given timestamp.
   * @param {Array} senders - Array of addresses -- in web3 currency
   * @param {Array} receivers - Array of addresses -- in web3 curreny
   * @param {Array} amounts - Array of amounts to send
   * @param {Int} timestamp - Timestamp of time after which payment should be made
   * @param {Function} mycallback - ({hash: {String}}) -> {...}
   * @param {String} ticker - Ticker of install crypto module
   */
  async sendPayment(
    senders = [],
    receivers = [],
    amounts = [],
    timestamp,
    unique_hash = "",
    mycallback = null,
    ticker
  ) {
    console.log("wallet sendPayment 1");
    // validate inputs
    if (senders.length != receivers.length || senders.length != amounts.length) {
      //mycallback({err: "Lengths of senders, receivers, and amounts must be the same"});
      return;
    }
    if (senders.length !== 1) {
      // We have no code which exercises multiple senders/receivers so can't implement it yet.
      console.error("sendPayment ERROR: Only supports one transaction");
      //mycallback({err: "Only supports one transaction"});
      return;
    }

    // only send if hasn't been sent before

    if (
      !this.doesPreferredCryptoTransactionExist(senders, receivers, amounts, unique_hash, ticker)
    ) {
      console.log("preferred crypto transaction does not already exist");
      const cryptomod = this.returnCryptoModuleByTicker(ticker);
      for (let i = 0; i < senders.length; i++) {
        //
        // DEBUGGING - sender is address to which we send the crypto
        //       - not our own publickey
        //
        if (senders[i] === cryptomod.returnAddress()) {
          // Need to save before we await, otherwise there is a race condition
          await this.savePreferredCryptoTransaction(
            senders,
            receivers,
            amounts,
            unique_hash,
            ticker
          );
          try {
            let unique_tx_hash = this.generatePreferredCryptoTransactionHash(
              senders,
              receivers,
              amounts,
              unique_hash,
              ticker
            );
            const hash = await cryptomod.sendPayment(amounts[i], receivers[i], unique_tx_hash);
            //
            // hash is "" if unsuccessful, trace_id if successful
            //
            if (hash === "") {
              console.log("Deleting preferred crypto transaction");
              this.deletePreferredCryptoTransaction(
                senders,
                receivers,
                amounts,
                unique_hash,
                ticker
              );
            }

            if (mycallback) {
              mycallback({ hash: hash });
            }
            return;
          } catch (err) {
            // it failed, delete the transaction
            console.log("sendPayment ERROR: payment failed....\n" + err);
            this.deletePreferredCryptoTransaction(senders, receivers, amounts, unique_hash, ticker);
            //mycallback({err: err});
            return;
          }
        } else {
          console.warn("Cannot send payment from wrong crypto address");
          console.log(cryptomod.name);
          console.log(senders[i], cryptomod.returnAddress());
        }
      }
    } else {
      console.log("sendPayment ERROR: already sent");
      //mycallback({err: "already sent"});
    }
  }

  /**
   * Checks that a payment has been received if the current user is the receiver.
   * @param {Array} senders - Array of addresses
   * @param {Array} receivers - Array of addresses
   * @param {Array} amounts - Array of amounts to send
   * @param {Int} timestamp - Timestamp of time after which payment should be made
   * @param {Function} mycallback - (Array of {address: {String}, balance: {Int}}) -> {...}
   * @param {String} ticker - Ticker of install crypto module
   * @param {Int} tries - (default: 36) Number of tries to query the underlying crypto API before giving up. Sending -1 will cause infinite retries.
   * @param {Int} pollWaitTime - (default: 5000) Amount of time to wait between tries
   * @return {Array} Array of {address: {String}, balance: {Int}}
   */
  async receivePayment(
    senders = [],
    receivers = [],
    amounts = [],
    timestamp,
    unique_hash = "",
    mycallback,
    ticker,
    tries = 36,
    pollWaitTime = 5000
  ) {
    let unique_tx_hash = this.generatePreferredCryptoTransactionHash(
      senders,
      receivers,
      amounts,
      unique_hash,
      ticker
    );

    if (senders.length != receivers.length || senders.length != amounts.length) {
      console.log(
        "receivePayment ERROR. Lengths of senders, receivers, and amounts must be the same"
      );
      return;
    }
    if (senders.length !== 1) {
      console.log("receivePayment ERROR. Only supports one transaction");
      return;
    }

    //
    // if payment already received, return
    //
    if (
      this.doesPreferredCryptoTransactionExist(senders, receivers, amounts, unique_hash, ticker)
    ) {
      mycallback();
      console.log("our preferred crypto transaction exists!");
      return 1;
    }

    const cryptomod = this.returnCryptoModuleByTicker(ticker);
    await cryptomod.onIsActivated();

    //
    // create a function we can loop through to check if the payment has come in....
    //
    const check_payment_function = async () => {
      console.log("wallet -> cryptmod receivePayment");
      return await cryptomod.receivePayment(
        amounts[0],
        senders[0],
        receivers[0],
        timestamp - 3,
        unique_tx_hash
      ); // subtract 3 seconds in case system time is slightly off
    };

    const poll_check_payment_function = async () => {
      console.log("poll_check_payment_function remaining tries: " + tries);
      let result = null;
      try {
        result = await check_payment_function();
      } catch (err) {
        console.log("receivePayment ERROR." + err);
        return;
        //mycallback({err: err});
      }
      did_complete_payment(result);
    };

    const did_complete_payment = (result) => {
      if (result) {
        // The transaction was found, we're done.
        console.log("TRANSACTION FOUND");
        this.savePreferredCryptoTransaction(senders, receivers, amounts, unique_hash, ticker);
        mycallback(result);
      } else {
        // The transaction was not found.
        tries--;
        // This is === rather than < because sending -1 is a way to do infinite polling
        if (tries != 0) {
          setTimeout(() => {
            poll_check_payment_function();
          }, pollWaitTime);
        } else {
          // There is no way to handle errors with the interface of receivePayment as it's been designed.
          // We will swallow this error and log it to the console and return.
          // Do not delete this console.log, at least maybe the engineer who is maintaining this needs
          // some hope of figuring out why the game isn't progressing.
          console.log(
            "Did not receive payment after " + (pollWaitTime * tries) / 1000 + " seconds"
          );
          return;
          // mycallback({err: "Did not receive payment after " + ((pollWaitTime * tries)/1000) + " seconds"});
        }
      }
    };
    await poll_check_payment_function();
    //});
  }

  generatePreferredCryptoTransactionHash(
    senders = [],
    receivers = [],
    amounts,
    unique_hash,
    ticker
  ) {
    return this.app.crypto.hash(
      Buffer.from(
        JSON.stringify(senders) +
          JSON.stringify(receivers) +
          JSON.stringify(amounts) +
          unique_hash +
          ticker,
        "utf-8"
      )
    );
  }

  async savePreferredCryptoTransaction(senders = [], receivers = [], amounts, unique_hash, ticker) {
    let sig = this.generatePreferredCryptoTransactionHash(
      senders,
      receivers,
      amounts,
      unique_hash,
      ticker
    );
    this.preferred_txs.push({
      sig: sig,
      ts: new Date().getTime(),
    });
    for (let i = this.preferred_txs.length - 1; i >= 0; i--) {
      if (this.preferred_txs[i].timestamp < new Date().getTime() - 100000000) {
        this.preferred_txs.splice(i, 1);
      }
    }

    await this.saveWallet();

    return 1;
  }

  doesPreferredCryptoTransactionExist(senders = [], receivers = [], amounts, unique_hash, ticker) {
    const sig = this.generatePreferredCryptoTransactionHash(
      senders,
      receivers,
      amounts,
      unique_hash,
      ticker
    );
    for (let i = 0; i < this.preferred_txs.length; i++) {
      if (this.preferred_txs[i].signature === sig) {
        return 1;
      }
    }
    return 0;
  }

  deletePreferredCryptoTransaction(senders = [], receivers = [], amounts, unique_hash, ticker) {
    const sig = this.generatePreferredCryptoTransactionHash(
      senders,
      receivers,
      amounts,
      unique_hash,
      ticker
    );
    for (let i = 0; i < this.preferred_txs.length; i++) {
      if (this.preferred_txs[i].signature === sig) {
        this.preferred_txs.splice(i, 1);
      }
    }
  }

  private async isSlipInPendingTransactions(input: Slip): Promise<boolean> {
    let pending = await this.getPendingTxs();
    for (let i = 0; i < pending.length; i++) {
      let ptx = pending[i];
      for (let ii = 0; ii < ptx.from.length; ii++) {
        if (input.utxoKey === ptx.from[ii].utxoKey) {
          return true;
        }
      }
    }
    return false;
  }

  /////////////////////
  // END WEB3 CRYPTO //
  /////////////////////

  //////////////////
  // UI Functions //
  //////////////////

  //
  // We can use this function to selectively exclude some things from the "wallet"
  // for backup purposes
  //
  exportWallet() {
    let newObj = JSON.parse(JSON.stringify(this.app.options));

    delete newObj.games;

    return JSON.stringify(newObj);
  }

  /**
   * Serialized the user's wallet to JSON and downloads it to their local machine
   */
  async backupWallet() {
    try {
      if (this.app.BROWSER == 1) {
        //let content = JSON.stringify(this.app.options);
        let pom = document.createElement("a");
        pom.setAttribute("type", "hidden");
        pom.setAttribute(
          "href",
          "data:application/json;utf-8," + encodeURIComponent(this.exportWallet())
        );
        pom.setAttribute("download", "saito.wallet.json");
        document.body.appendChild(pom);
        pom.click();
        pom.remove();
      }
    } catch (err) {
      console.log("Error backing-up wallet: " + err);
    }
  }

  async restoreWallet(file) {
    console.log("restoring wallet...");
    let wallet_reader = new FileReader();
    wallet_reader.readAsBinaryString(file);
    wallet_reader.onloadend = async () => {
      let decryption_secret = "";
      let decrypted_wallet = wallet_reader.result.toString();
      try {
        let wobj = JSON.parse(decrypted_wallet);
        await this.reset();
        await this.setPublicKey(wobj.wallet.publicKey);
        await this.setPrivateKey(wobj.wallet.privateKey);
        wobj.wallet.version = this.version;
        wobj.wallet.inputs = [];
        wobj.wallet.outputs = [];
        wobj.wallet.spends = [];
        wobj.games = [];
        //wobj.gameprefs = {}; //Don't delete gameprefs
        this.app.options = wobj;

        await this.app.blockchain.resetBlockchain();
        // this.app.storage.saveOptions(); //Included above, no need to double save

        alert("Restoration Complete ... click to reload Saito");
        window.location.reload();
      } catch (err) {
        if (err.name == "SyntaxError") {
          alert("Error reading wallet file. Did you upload the correct file?");
        } else if (false) {
          // put this back when we support encrypting wallet backups again...
          alert("Error decrypting wallet file. Password incorrect");
        } else {
          alert("Unknown error<br/>" + err);
        }
      }
    };
  }

  /**
   * If the to field of the transaction contains a pubkey which has previously negotiated a diffie-hellman
   * key exchange, encrypt the message part of message, attach it to the transaction, and resign the transaction
   * @param {Transaction}
   * @return {Transaction}
   */
  async signAndEncryptTransaction(tx: Transaction, recipient = "") {
    if (tx == null) {
      return null;
    }

    //
    // convert tx.msg to base64 tx.ms
    //
    // if the transaction is of excessive length, we cut the message and
    // continue blank. so be careful kids as there are some hardcoded
    // limits in NodeJS!
    //
    try {
      if (recipient == "") {
        if (this.app.keychain.hasSharedSecret(tx.to[0].publicKey)) {
          tx.msg = this.app.keychain.encryptMessage(tx.to[0].publicKey, tx.msg);
        }
      } else {
        if (this.app.keychain.hasSharedSecret(recipient)) {
          tx.msg = this.app.keychain.encryptMessage(recipient, tx.msg);
        }
      }

      //
      // nov 25 2022 - eliminate base64 formatting for TXS
      //
      //tx.m = Buffer.from(
      //  this.app.crypto.stringToBase64(JSON.stringify(tx.msg)),
      //  "base64"
      //);
      tx.data = Buffer.from(JSON.stringify(tx.msg), "utf-8");
    } catch (err) {
      console.log("####################");
      console.log("### OVERSIZED TX ###");
      console.log("###   -revert-   ###");
      console.log("####################");
      console.log(err);
      tx.msg = {};
    }

    await tx.sign();

    return tx;
  }

  public async fetchBalanceSnapshot(key: string) {
    try {
      console.log("fetching balance snapshot for key : " + key);
      let response = await fetch("/balance/" + key);
      let data = await response.text();
      let snapshot = BalanceSnapshot.fromString(data);
      if (snapshot) {
        await S.getInstance().updateBalanceFrom(snapshot);
      }
    } catch (error) {
      console.error(error);
    }
  }
}
