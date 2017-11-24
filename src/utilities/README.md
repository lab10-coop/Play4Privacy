This directory contains helper tasks for the backend.  
Some of those scripts share dependencies with the *regular* backend code, e.g. DB models.  
Config (e.g. Mongo DB name) is to be delivered via environment variables.

## Wallet Mailer

`sendWallets.js` is for the daily mailing of (locked) wallets to players who asked for that service.  
Tasks are fetched from the Mongo DB shared with the backend and marked as done there.  
It uses [nodemailer](https://nodemailer.com) which is wrapped by `Mailer.js`.  

Example use:  
`MAILER_HOST=mail.gandi.net MAILER_USER="no-reply@lab10.io" MAILER_PASS=<thisisasecret> MAILER_DELAY=5 MONGO_DB_NAME=mainnet npm run mailer send`

## Token Payout

Since the initial plan to have tokens automatically paid out after every game was rejected in favour of more batching, token payout functionality was moved to a maintenance task.  
It's implemented in `payout.js` and requires one of this commands:
* calc: only calculates and prints out how many tokens are unclaimed / redeemed / donated (state in DB)
* simulate: additionally simluates the transactions it would send. This includes batching into several transactions if needed, initializing the contract, calling `estimateGas()` with the actual parameters and printing out detailled information like e.g. gas limits set per transaction.
* payout: additionally sends the transaction and marks the processed entries in DB as done (so that executing this twice won't send tokens twice)

The Mongo DB name and Ethereum params (path to node, contract address, sender account, gas price) are to be configured via ENV.  
Run `npm run payout` (without command) for more details. 

Example use:  
`MONGO_DB_NAME=mainnet ETH_P4P_ADDR=0x0e729d44c86fdbcd28b6b973ac0f2255ca6005ea ETH_ACCOUNT=0xf2e64d6a95b1be059af2dd044df40f8d36c0e121 ETH_GASPRICE_GWEI=0.2 ETH_NODE=http://localhost:8545 npm run simulate`

**CAUTION**: the *payout* command does reset the state in DB, but does not inform the backend process about this change.  
At this stage this needs to be done manually by either restarting the backend process or by writing `reloadTokens` to the named pipe `control.pipe` (which needs to have existed before the process was started).

## Legacy Token Processing / Payout

Since during the first days of P4P the DB persisting and processing part was not ready, a log parser was written as an intermediate solution.  
Invoking `extract_payouts_from_log.sh` with an input logfile (containing only the timeframe wanted) as first argument and an output directory as second argument will invoke `calcPayoutsFromLogs.js`. Several files are created in the output directory (not automatically deleted in order to make debugging easy if needed), with the final result saved in `RESULT.json`.
No further automation was done (it being an intermediate solution anyway). However with the result file, a few manual steps in truffle console were enough to get the tokens distributed: 
```
game = P4PGame.at("0x78Cb0dB58721596Bc79Dc9D8d8296212D153D804")

fs = require('fs')

res = JSON.parse(fs.readFileSync('somepath/RESULT.json'))

// splitting into 2 transactions
thresh = 35
addrs1 = res.redeem.map(e => e[0]).slice(0,thresh)
addrs2 = res.redeem.map(e => e[0]).slice(thresh)

amounts1 = res.redeem.map(e => e[1]).slice(0,thresh)
amounts2 = res.redeem.map(e => e[1]).slice(thresh)

// add donations to dev team
addrs2 = addrs2.concat(["0x57f81fa922527198c9e8d4ac3a98971a8c46e7e2"])
amounts2 = amounts2.concat([res.donate.map(e => e[1]).reduce((sum, e) => sum + e, 0)])

game.distributeTokens(addrs1, amounts1)
game.distributeTokens(addrs2, amounts2)
```  

Here the splitting into 2 transaction was hardcoded because during the time this solution was used that worked fine.

Fun fact: This solution had an economic incentive to be replaced:  
Players redeeming some tokens and donating some at the same evening kept all the tokens for themselves because it would have required extra effort to correctly calculate that split up. Thus during the time this was in use, the dev team *lost* donations. 

## State Processing and Publishing

Since the whole logic for processing and publishing game state was also not ready when playing started, the initially intended logic of one transaction per game was not used, instead at the end of the playing phase, it was all condensed into one transaction (also see README in `blockchain` directory).  
To mostly automate this, the node script `persistPlayedGames.js` and the shell script with the elegant name `add_to_ipfs_and_get_data_for_eth.sh` where written.  
The final manual process then looks like this:
* `npm run persist db2json` reads all state data from DB into json files - one file per game using the game id (start timestamp) as filename. Note that this can take pretty long for large states because of address extraction from vote signatures.
* `add_to_ipfs_and_get_data_for_eth <input dir> <states metadata file>` takes those json files, writes them to IPFS and compiles a single json file containing one metadata object (input filename, ipfs hash (original base58), ipfs hash converted for Ethereum (hex), final gameboard (hex)) per game, written to <states metadata file>.
* `npm run states2blockchain <states metadata file>` extracts the state hashes (converted IPFS hashes) and board states (the format is documented in the source, function `boardArrToHex()`) and writes them to the Blockchain in a single transaction (for P4P that did fit).
* `npm run states2ipfslist <states metadata file> <states html file>` creates a minimal html document with the IPFS hashes linked to the ipfs.io gateway.
* Finally, `ipfs add <states metadata file> && ipfs add <states html file>` also adds the summary files to IPFS.

For P4P, the so created summary files were:
* [QmVcE46HnxU6SaeQygxotL64GNQQtaAbBregmfmMjBNsoz](https://ipfs.io/ipfs/QmVcE46HnxU6SaeQygxotL64GNQQtaAbBregmfmMjBNsoz)
* [QmRGBb9axQM3qBRDTSAUYvU2zk6JAaHR6A9nWMZZhKeKAV](https://ipfs.io/ipfs/QmRGBb9axQM3qBRDTSAUYvU2zk6JAaHR6A9nWMZZhKeKAV)
And an example for the raw state file for a single games: [QmUQa1sa3AEZJsrdBJpcXeerhnUuU9iBW4nuiNVuzonuGB](https://ipfs.io/ipfs/QmUQa1sa3AEZJsrdBJpcXeerhnUuU9iBW4nuiNVuzonuGB) 

Note that in order to make the files added to IPFS available to the Internet, an IPFS daemon needs to be running. Instructions for that our out of scope here.

The gamestate hashes and final board states were written to Ethereum mainnet in transaction [0x9f341944eb0fe23e70819c470a9a7bb96ee643abd95f887067085bef53e5bdfc](https://etherscan.io/tx/0x9f341944eb0fe23e70819c470a9a7bb96ee643abd95f887067085bef53e5bdfc).

### Verification

What's so far lacking is a builtin possibility to verify the states. But it's pretty easy anyway. For example:
* Lookup [the relevant transaction in Etherscan](https://etherscan.io/tx/0x9f341944eb0fe23e70819c470a9a7bb96ee643abd95f887067085bef53e5bdfc)
* In field `Input Data`, the gamestate hashes are nicely formatted line by line (starting at [3] and ending at [360]). Copy an entry you want to verify.
* Go to http://lenschulwitz.com/base58 and paste the string into the 3rd input field (*Bitcoin Address Base58 Encoder*), prefix it with "1220", then click *Encode*
* Lookup the resulting IPFS hash (base58 encoded multihash) in your IPFS client (`ipfs cat <hash>`) or on an IPFS gateway.
You may go on and 
* verify individual signatures of player's votes (e.g. using the web3 library)
* summarize moves => tokens per player and day and compare it with the tokens issued on the Blockchain

NOTE: for the first 3 days of P4P, move signatures are missing (they were created, but not correctly and were thus not included).
