import DatabaseWrapper, { connectToDb } from '../Database';
import Web3 from 'web3';
import ContractMetadata from '../_P4PContract'

const donationAddr = "0x57f81fa922527198c9e8d4ac3a98971a8c46e7e2";
let maxGasPerTx = 0;

/** @returns a promise for a working contract */
function ethInit() {
  // doesn't support https. But nothing secret should be transferred anyway
  // beware: even if this passes without error we can't be sure to have a working connection
  global.web3 = new Web3(process.env.ETH_NODE || Web3.givenProvider);

  const account = process.env.ETH_ACCOUNT || "0xFe4E89f620a8663d03136bee040904fe3A623f5D";
  const contractAddress = process.env.ETH_P4P_ADDR || "0x78Cb0dB58721596Bc79Dc9D8d8296212D153D804";
  const gasPrice = process.env.ETH_GASPRICE_GWEI * 1E9 + 7 || 4 * 1E9 + 7; // default: 4 gwei. +7 for frontrunning

  return new Promise( (resolve, reject) => {
    console.log(`initializing contract at address ${contractAddress}`);
    const contract = new web3.eth.Contract(ContractMetadata.abi, contractAddress);
    console.log('contract initialized');

    // Retrieve the token address. This also tests if we have a working connection and contract instance
    contract.methods.getTokenAddress().call().then(tokenAddr => {
      console.log(`token address is ${tokenAddr}`);
      resolve(contract);
    });
    contract.options.from = account;

    web3.eth.getBlock("latest").then( block => {
      /* This is a guess about what's a safe value for max gas limit per TX.
      Shouldn't be too high (risk: tx remains in pool if not offering elevated gas price)
      or too low (need to split up work into many transactions when there's many players) */
      maxGasPerTx = block.gasLimit / 4;
    });
    console.log(`setting gasPrice to ${gasPrice / 1E9} GWei`);
    contract.options.gasPrice = gasPrice;
  });
}

/** param tokenReceivers */
function payout(contract, addresses, amounts, simulateOnly) {
  global.contract = contract;
  return new Promise((resolve, reject) => {
    const startTs = Date.now();

    // check if we got valid params
    if (addresses.length !== amounts.length
      || amounts.filter(e => isNaN(e) || e >= 1 << 16 || e == 0).length != 0
      || addresses.filter(e => !web3.utils.isAddress(e)).length != 0) {
      console.error(`Malformed parameters in payout(): 
      ${addresses}
      ${amounts}`);
      return null;
    }

    contract.methods.distributeTokens(addresses, amounts).estimateGas().then(gasEstimate => {
      let gasLimit = gasEstimate + Math.round(gasEstimate * 0.1); // estimate + 10%
      if (gasLimit > maxGasPerTx) {
        /* Something may be wrong here (e.g. contract exception, see https://ethereum.stackexchange.com/a/8093/4298), thus interrupting */
        console.error(`Gas cost error: estimate based limit ${gasLimit} exceeds maxGasPerTx ${maxGasPerTx}. Manual investigation needed!`);
        reject();
      }

      console.log(`distributeTokens(): gas limit ${gasLimit}, gasPrice ${contract.options.gasPrice} and args:
            ${addresses},
            ${amounts}`);

      if (! simulateOnly) {
        console.log('SENDING TRANSACTION...');
        contract.methods.distributeTokens(addresses, amounts).send({gas: gasLimit})
          .once('transactionHash', txHash => {
            console.log(`tx ${txHash} sent: distributeTokens with ${addresses.length} token receivers, gas limit set to ${gasLimit}`);
            resolve(txHash);
          }).once('receipt', receipt => {
          //console.log(`receipt: ${JSON.stringify(receipt)}`);
          const runtime = Math.floor((Date.now() - startTs) / 1000);
          const txCost = contract.options.gasPrice * receipt.gasUsed / 1E15; // in finney (milliEther)
          // success can be guessed (with high probability) by checking gasUsed. See https://ethereum.stackexchange.com/questions/6007/how-can-the-transaction-status-from-a-thrown-error-be-detected-when-gas-can-be-e
          const success = receipt.gasUsed < gasLimit ? true : false;
          if (!success) {
            console.error(`tx ${receipt.transactionHash} seems to have failed (all gas used)`);
          }
          console.log(`tx ${receipt.transactionHash} done: after ${runtime} seconds in block ${receipt.blockNumber} consuming ${receipt.gasUsed} gas - paid ${txCost.toFixed(2)} finney`);
          resolve(receipt.transactionHash, success);
        }).on('confirmation', (confirmationNumber, receipt) => {
          //console.log(`confirmation: ${confirmationNumber}`);
        }).on('error', console.error);
      } else {
        setTimeout(() => {
          resolve();
        }, 2000);
      }
    });
  });
}

// resets redeemed and donated to 0 for all given token entries
function resetToZero(tokEntries) {
  tokEntries.map(t => t.redeemed = 0);
  tokEntries.map(t => t.donated = 0);
  Promise.all(tokEntries.map(t => t.save())).then( () => {
    console.log("all reset and saved");
  });
}
global.resetToZero = resetToZero;

let sumDonated = 0; // this is a bit ugly (shared state), but convenient

function calcPayoutsFromDb() {
  return new Promise((resolve, reject) => {
    global.db = new DatabaseWrapper();
    connectToDb(`mongodb://mongo:27017/${process.env.MONGO_DB_NAME}`, () => {
      console.log('Database connected!');

      db.getAllTokens().then(allTok => {
        global.allTok = allTok;
        console.log(`has ${allTok.length} entries`);

        //allTok.map(tok => console.log(`userId: ${tok.userId}, unclaimed ${tok.unclaimed}, redeemed: ${tok.redeemed}, donated: ${tok.donated}`));

        const sumUnclaimed = allTok.map(t => t.unclaimed).reduce((sum, v) => sum + v, 0);
        const sumRedeemed = allTok.map(t => t.redeemed).reduce((sum, v) => sum + v, 0);
        sumDonated = allTok.map(t => t.donated).reduce((sum, v) => sum + v, 0);

        console.log(`SUMMARY: unclaimed: ${sumUnclaimed}, redeemed: ${sumRedeemed}, donated: ${sumDonated}`);

        const receivers = allTok.filter(t => t.redeemed > 0 && web3.utils.isAddress(t.userId));

        const nrReceivers = receivers.length;
        const nrBatches = Math.ceil(nrReceivers / 60);
        const itemsPerBatch = Math.ceil(nrReceivers / nrBatches) || 0;
        console.log(`nrReceivers ${nrReceivers}, nrBatches ${nrBatches}, itemsPerBatch ${itemsPerBatch}`);

        let batches = [];
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

function calcAndPayoutBatched(simulate) {
  Promise.all([ethInit(), calcPayoutsFromDb()]).then((results) => {
    console.log("lets go!");

    // pretty clumsy way to get values out of promises
    const contract = results[0];
    const batches = results[1];
    let promiseChain = Promise.resolve();

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      let addresses = batch.map(t => t.userId);
      let amounts = batch.map(t => t.redeemed);
      // concat donated to the first batch.
      // Theoretical bug: donations will be lost if nobody redeemed
      if (i === 0) {
        if (sumDonated > 0) {
          addresses.push(donationAddr);
          amounts.push(sumDonated);
        }
      }
      console.log(`queuing batch ${i} with ${batch.length} entries`);
      promiseChain = promiseChain.then(payout.bind(null, contract, addresses, amounts, simulate));
    }
  });
}

switch(process.argv[2]) {
  case 'payout':
    calcAndPayoutBatched(false);
    break;
  case 'simulate':
    calcAndPayoutBatched(true);
    break;
  case 'resetDB':
    //resetToZero();
    break;
  default:
    console.error('what should I do?');
}
