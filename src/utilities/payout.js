import fs from 'fs';
import Web3 from 'web3';
import ContractMetadata from '../_P4PContract';
import DatabaseWrapper, { connectToDb } from '../Database';

const donationAddr = '0x57f81fa922527198c9e8d4ac3a98971a8c46e7e2';
const txBatchSize = 60; // max token receivers per tx
let maxGasPerTx = 0; // dynamically set as fraction of the block gas limit

// this is pre-initializing it for client-only functionality
let web3 = new Web3(Web3.givenProvider);
global.web3 = web3; // for debug sessions

/** @returns a promise for a working contract */
function ethInit() {
  // doesn't support https. But nothing secret should be transferred anyway
  // beware: even if this passes without error we can't be sure to have a working connection
  web3 = new Web3(process.env.ETH_NODE || Web3.givenProvider);

  const account = process.env.ETH_ACCOUNT || '0xFe4E89f620a8663d03136bee040904fe3A623f5D';
  const contractAddress = process.env.ETH_P4P_ADDR || '0x78Cb0dB58721596Bc79Dc9D8d8296212D153D804';
  const gasPrice = (process.env.ETH_GASPRICE_GWEI * 1E9) + 7 || (1 * 1E9) + 7; // default: 1 gwei. +7 for frontrunning

  return new Promise((resolve) => {
    console.log(`initializing contract at address ${contractAddress}`);
    const contract = new web3.eth.Contract(ContractMetadata.abi, contractAddress);
    console.log('contract initialized');

    // Retrieve the token address. This also tests if we have a working connection and contract
    contract.methods.getTokenAddress().call().then((tokenAddr) => {
      console.log(`token address is ${tokenAddr}`);
      resolve(contract);
    });
    contract.options.from = account;

    web3.eth.getBlock('latest').then((block) => {
      /* This is a guess about what's a safe value for max gas limit per TX.
      Shouldn't be too high (risk: tx remains in pool if not offering elevated gas price)
      or too low (need to split up work into many transactions when there's many players) */
      maxGasPerTx = block.gasLimit / 4;
    });
    console.log(`setting gasPrice to ${gasPrice / 1E9} GWei`);
    contract.options.gasPrice = gasPrice;
  });
}

/** Executes the payout to the given receivers on the blockchain (if simulateOnly not true)
 * @param txSentCallback is function(txHash) and called as soon as a transaction is pending.
 * @returns a promise for the transaction receipt
 * Note that promise resolution isn't guaranteed. Waiting for it may time out. */
function payout(contract, addresses, amounts, simulateOnly, txSentCallback) {
  global.contract = contract;
  return new Promise((resolve, reject) => {
    const startTs = Date.now();

    // check if we got valid params
    if (addresses.length !== amounts.length
      || amounts.filter(e => isNaN(e) || e >= (1 << 16) || e === 0).length !== 0 // eslint-disable-line no-bitwise
      || addresses.filter(e => !web3.utils.isAddress(e)).length !== 0) {
      console.error(`Malformed parameters in payout(): 
      ${addresses}
      ${amounts}`);
      reject();
    }

    contract.methods.distributeTokens(addresses, amounts).estimateGas().then((gasEstimate) => {
      const gasLimit = gasEstimate + Math.round(gasEstimate * 0.1); // estimate + 10%
      if (gasLimit > maxGasPerTx) {
        /* Something may be wrong here (e.g. contract exception,
        see https://ethereum.stackexchange.com/a/8093/4298), thus interrupting */
        console.error(`Gas cost error: estimate based limit ${gasLimit} exceeds maxGasPerTx ${maxGasPerTx}.\
         Manual investigation needed!`);
        reject('gas cost error');
      }

      console.log(`distributeTokens(): gas limit ${gasLimit}, gasPrice ${contract.options.gasPrice} and args:
            ${addresses},
            ${amounts}`);

      if (!simulateOnly) {
        const now = new Date();
        // build string of the form <month>.<day>_<unix timestamp>
        const nowStr = `${now.getMonth() + 1}.${now.getUTCDate()}_${Math.floor(now.getTime() / 1000).toString()}`;
        /* The log file will contain a json object after it's all over.
        If the tx times out, the receipt is missing and the json malformatted. */
        const txLogFile = fs.openSync(`logs/payout_${nowStr}.json`, 'w');
        fs.writeSync(txLogFile, '{');
        const txIn = contract.methods.distributeTokens(addresses, amounts);
        // console.log(`SENDING TRANSACTION: ${JSON.stringify(txIn)}`);
        fs.writeSync(txLogFile, `"txIn": ${JSON.stringify(txIn)},`);
        txIn.send({ gas: gasLimit })
          .once('transactionHash', (txHash) => {
            console.log(`tx ${txHash} sent: distributeTokens with ${addresses.length} token receivers, \
            gas limit set to ${gasLimit}`);
            web3.eth.getTransaction(txHash).then((txPending) => {
              // contains the information we'd need in order to rebroadcast the tx (after copying 'input' to 'data')
              fs.writeSync(txLogFile, `"txPending": ${JSON.stringify(txPending)},`);
            });
            txSentCallback(txHash);
          }).once('receipt', (receipt) => {
            fs.writeSync(txLogFile, `"receipt": ${JSON.stringify(receipt)}`);
            fs.writeSync(txLogFile, '}');
            const runtime = Math.floor((Date.now() - startTs) / 1000);
            const txCost = (contract.options.gasPrice * receipt.gasUsed) / 1E15; // in finney (milliEther)
            /* from Metropolis onwards there's a status field.
            prior to that, success can be guessed (with high probability) by checking gasUsed. \
            See https://ethereum.stackexchange.com/questions/6007/how-can-the-transaction-status-from-a-thrown-error-be-detected-when-gas-can-be-e */
            const success = receipt.status !== 'undefined' ? receipt.status : receipt.gasUsed;
            if (success) {
              console.log(`tx ${receipt.transactionHash} successfully mined`);
              resolve(receipt);
            } else {
              console.error(`tx ${receipt.transactionHash} failed`);
              reject(receipt);
            }
            console.log(`tx ${receipt.transactionHash} done: after ${runtime} seconds in block ${receipt.blockNumber} \
            consuming ${receipt.gasUsed} gas - paid ${txCost.toFixed(2)} finney`);
          }).on('confirmation', (confirmationNumber, receipt) => {
            console.log(`tx ${receipt.transactionHash} confirmation: ${confirmationNumber}`);
          })
          .on('error', console.error);
      } else {
        // add a bit of delay in simulation mode
        setTimeout(() => {
          resolve('receipt placeholder');
        }, 2000);
      }
    });
  });
}

/** resets redeemed and donated to 0 for all given token entries.
 * @returns promise for all done */
function resetToZero(tokEntries) {
  tokEntries.forEach(t => (t.redeemed = 0)); // eslint-disable-line no-return-assign
  tokEntries.forEach(t => t.donated = 0); // eslint-disable-line no-return-assign
  return Promise.all(tokEntries.map(t => t.save())).then(() => {
    console.log(`${tokEntries.length} entries reset and saved`);
  });
}
global.resetToZero = resetToZero;

let sumDonated = 0; // this is a bit ugly (shared state), but convenient

/** gets an array of token receivers (most importantly address and amount) from DB and slices it into batches.
 * Donations are summed and added to the first batch.
 * @returns an array of batches. */
function calcPayoutsFromDb() {
  return new Promise((resolve) => {
    const db = new DatabaseWrapper();
    global.db = db; // for debugging
    connectToDb(`mongodb://mongo:27017/${process.env.MONGO_DB_NAME}`, () => {
      console.log('Database connected!');

      db.getAllTokens().then((allTok) => {
        global.allTok = allTok;
        console.log(`has ${allTok.length} entries`);

        const sumUnclaimed = allTok.map(t => t.unclaimed).reduce((sum, v) => sum + v, 0);
        const sumRedeemed = allTok.map(t => t.redeemed).reduce((sum, v) => sum + v, 0);
        sumDonated = allTok.map(t => t.donated).reduce((sum, v) => sum + v, 0);

        console.log(`SUMMARY: unclaimed: ${sumUnclaimed}, redeemed: ${sumRedeemed}, donated: ${sumDonated}`);

        const receivers = allTok.filter(t => t.redeemed > 0 && web3.utils.isAddress(t.userId));

        const nrReceivers = receivers.length;
        const nrBatches = Math.ceil(nrReceivers / txBatchSize);
        const itemsPerBatch = Math.ceil(nrReceivers / nrBatches) || 0;
        console.log(`nrReceivers ${nrReceivers}, nrBatches ${nrBatches}, itemsPerBatch ${itemsPerBatch}`);

        const batches = [];
        let lower = 0;
        let upper = itemsPerBatch;
        while (lower !== upper && upper <= nrReceivers) {
          console.log(`slicing from ${lower} to ${upper}`);
          batches.push(receivers.slice(lower, upper));
          lower = upper;
          upper += itemsPerBatch;
          if (upper > nrReceivers) {
            upper = nrReceivers;
          }
        }
        console.log(`split into ${batches.length} batches`);
        resolve(batches);
      });
    });
  });
}

/** @param doneCallback expects function(err). err is left unset on success.
 * Called when all transactions were mined and the entries reset in DB */
function calcAndPayoutBatched(simulate, doneCallback) {
  Promise.all([ ethInit(), calcPayoutsFromDb() ]).then((results) => {
    console.log('lets go!');

    // pretty clumsy way to get values out of promises
    const contract = results[0];
    const batches = results[1];
    let promiseChain = Promise.resolve();
    const resetPromises = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const addresses = batch.map(t => t.userId);
      const amounts = batch.map(t => t.redeemed);
      // concat donated to the first batch.
      // Theoretical bug: donations will be lost if nobody redeemed
      if (i === 0) {
        if (sumDonated > 0) {
          addresses.push(donationAddr);
          amounts.push(sumDonated);
        }
      }
      console.log(`queuing batch ${i} with ${batch.length} entries`);
      promiseChain = promiseChain.then(payout.bind(null, contract, addresses, amounts, simulate, () => {
        console.log(`payout scheduled for batch ${i}`);
        if (!simulate && !process.env.SKIP_RESET_DB) {
          resetPromises.push(resetToZero(batch));
        }
      })).catch((receipt) => {
        console.error(`payout failed for batch ${i}: ${JSON.stringify(receipt)}`);
      });
    }

    Promise.all([ promiseChain ].concat(resetPromises)).then(() => {
      doneCallback();
    }).catch(() => {
      doneCallback('not all went smooth');
    });
  });
}

function usageExit() {
  console.error(`
usage: ${process.argv[1]} calc | simulate | payout
Only the payout command will change the state of the DB and of the Blockchain.
ENV variables used:
  MONGO_DB_NAME (required)
  ETH_NODE (fallback: Web3.provider)
  ETH_P4P_ADDR (fallback: 0x78Cb0dB58721596Bc79Dc9D8d8296212D153D804)
  ETH_ACCOUNT (fallback: 0xFe4E89f620a8663d03136bee040904fe3A623f5D)
  ETH_GASPRICE_GWEI (fallback: 1 Gwei. Can also be a floating point number, e.g. 0.3)
  SKIP_RESET_DB (dev: don't reset entries in DB for payout cmd)
  DONT_EXIT (dev: keep the process running after all done. Useful when run with --inspect)
`);
  process.exit(1);
}

if (!process.env.MONGO_DB_NAME) {
  usageExit();
}
switch (process.argv[2]) {
  case 'calc':
    calcPayoutsFromDb().then(process.exit);
    break;
  case 'payout':
    calcAndPayoutBatched(false, (err) => {
      console.log('all done!  ');
      if (!process.env.DONT_EXIT) {
        process.exit(err ? 1 : 0);
      }
    });
    break;
  case 'simulate': // will not write to the Blockchain and not reset the DB
    calcAndPayoutBatched(true, (err) => {
      if (!process.env.DONT_EXIT) {
        process.exit(err ? 1 : 0);
      }
    });
    break;
  default:
    usageExit();
}
