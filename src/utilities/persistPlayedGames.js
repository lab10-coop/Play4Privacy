import fs from 'fs';
import Web3 from 'web3';
import IPFS from 'ipfs';
import StateContract from '../_P4PState';
import DatabaseWrapper, { connectToDb } from '../Database';

// this is pre-initializing it for client-only functionality
let web3 = new Web3(Web3.givenProvider);
global.web3 = web3; // for debug sessions

/** @returns a promise for a working contract */
function ethInit() {
  // doesn't support https. But nothing secret should be transferred anyway
  // beware: even if this passes without error we can't be sure to have a working connection
  web3 = new Web3(process.env.ETH_NODE || Web3.givenProvider);

  const account = process.env.ETH_ACCOUNT || '0xFe4E89f620a8663d03136bee040904fe3A623f5D';
  const contractAddress = process.env.ETH_STATE_ADDR || '';
  const gasPrice = (process.env.ETH_GASPRICE_GWEI * 1E9) + 7 || (1 * 1E9) + 7; // default: 1 gwei. +7 for frontrunning

  return new Promise((resolve) => {
    console.log(`initializing contract at address ${contractAddress}`);
    const contract = new web3.eth.Contract(StateContract.abi, contractAddress);
    console.log('contract initialized');

    // Retrieve the token address. This tests if we have a working connection and contract
    contract.methods.addGames([], []).call().then(() => {
      console.log('test call succeeded');
      resolve(contract);
    });
    contract.options.from = account;
  });
}

function getPlayedGames() {
  return new Promise((resolve) => {
    const db = new DatabaseWrapper();
    global.db = db; // for debugging
    connectToDb(`mongodb://mongo:27017/${process.env.MONGO_DB_NAME}`, () => {
      console.log('Database connected!');

      db.getAllPlayedGames().then((allGames) => {
        global.allGames = allGames;
        console.log(`has ${allGames.length} entries`);
        resolve(allGames);
      });
    });
  });
}

/** @params arr integer array of final board. 1: black, -1: white, 0: unset
 * Is mapped to 0: unset, 1 black, 2 white. Which means 2 bit per field
 * Example: black, white, unset = 1, -1, 0 => 1, 2, 0 => 011100
 * We have 9x9 = 81 fields. Thus ceil(81 / 4) = 21 bytes are needed
 * @return encoded board represented as hex string */
function boardArrToHex(arr) {
  // const unsignedArr = arr.map(e => e === -1 ? 2 : e );
  // const bitString = unsignedArr.reduce((bitStr, e) => bitStr += e.toString(2).padStart(2, '0'), ''); // thx god for padStart()!
  // and now? how to convert this to a hex string?

  // giving up on functional elegance and constructing it bit by bit instead
  let i = 0;
  let halfByte;
  let hexStr = '';
  while (i < arr.length) {
    const uint = arr[i] === -1 ? 2 : arr[i]; // map to unsigned int
    if (++i % 2 === 0) {
      halfByte |= uint;
    } else {
      halfByte = uint << 2;
    }
    // when filling 4 bit or reaching the end of the array, spit out another hex char
    if(i % 2 === 0 || i === arr.length) {
      hexStr += halfByte.toString(16)
    }
    //console.log(`i=${i}, uint=${uint}, halfByte=${halfByte}, hexStr=${hexStr}`);
  }
  return hexStr;
}
global.boardArrToHex = boardArrToHex;

function getPlayerByMove(gameId, move) {
  const sigData = `${gameId}_${move.round}_${move.move}`;
  const addr = web3.eth.accounts.recover(sigData, move.sig);
  // console.log(`sigData `);
  return addr;
}

/*
27, 28.9. gameId is not set and submitted moves can not be associated to players. players array is however set.
maybe filter out interrupted games, like e.g. 1506877534 (nrSelectedMoves != 60).
TODO: find out when token calc switched from log to DB.
TODO: find out when switched to 5 moves rule. Likely on 19.10.
What about claims? Are in distinct DB. With date, without amount. Not really useful.
TODO: write one json file per game. Include address per move proposal. Leave out players array?

Total: 527 736 valid moves. Tokens created: 917 841. That's ab bit less than double.
Unclaimed tokens and a few pre-launch tokens missing.
BUT!!! 5 moves rule should distort token talk. Probably only few players were aware / used it, because was never hinted at.
Could be calculated by checking multiple votes per player and round

Interrupted games missing (not the case for tokens)
*/

/** takes a game (as read from DB) and converts it to a state object to be published
 * Address extraction from signatures is the bottleneck (CPU) */
function gameToStateObject(game) {
  const board = game.board;
  const fixedId = game.gameId !== undefined ? game.gameId : Math.round(game.startDate.getTime() / 1000);
  console.log(`gameId ${game.gameId}, fixedId ${fixedId}, startDate ${game.startDate}, nrSubmittedMoves: ${game.submittedMoves.length}, nrSelectedMoves: ${game.selectedMoves.length}, nrPlayers: ${game.players.length}, nrTokenReceivers: ${game.tokenReceivers.length}`);
  const votes = [];
  game.submittedMoves.forEach((sm) => {
    let player = null;
    if (game.gameId !== undefined) { // extracting the player works only for games having a gameId
      let cntIncl = 0, cntNotIncl = 0;
      let notIncl = [];
      player = getPlayerByMove(game.gameId, sm);
      if (game.players.map(p => p.userId.toLowerCase().includes(player.toLowerCase()))) {
        // console.log(`move extracted player ${player} is included in players`);
        cntIncl++;
      } else {
        console.log(`move extracted player ${player} is NOT included in players`);
        cntNotIncl++;
        notIncl.push(player);
      }
    }

    let vote = { round: sm.round, field: sm.move};
    if (player) {
      vote.player = player;
      vote.signature = sm.sig; // signature is useless if we can't extract the player
    }
    votes.push(vote);
  });
  console.log(`${votes.length} votes`);
  // console.log(`Not included: ${notIncl}`);

  console.log(`in: ${board}`);
  console.log(`out: ${boardArrToHex(board)}`);

  /*
  First 2 days: moves missing, in votes player and signature missing
   */
  return {
    id: fixedId,
    startDate: game.startDate,
    moves: game.selectedMoves,
    finalBoard: game.board,
    votes: votes,
  };
}

/** returns a promise which resolves when all (valid) games in DB were processed and written to a JSON file */
function dbToJsonFiles(outDir) {
  return Promise.all([ getPlayedGames().then((allGames) => {
    allGames
      .filter(g => g.selectedMoves.length === 0 || g.selectedMoves.length === 60) // accept only full games (where we can check that at all)
      // .filter(g => g.gameId !== undefined)
      // .filter(g => g.gameId > 1508889600)
      .forEach((game) => {
        const state = gameToStateObject(game);
        fs.writeFileSync(`${outDir}/${state.id}.json`, JSON.stringify(state, null, 2)); // prettified JSON
      });
  }) ]);
}

function initIpfs() {
  const node = new IPFS();

  return new Promise((resolve) => {
    node.on('ready', (err, ret) => {
      console.log(`ready: err: ${err}, ret: ${ret}`);

      node.version((err, version) => {
        console.log(`version: err: ${err}, ret: ${JSON.stringify(version)}`);
      });
      resolve(node);
    });
  });
}

// @returns the object from a given json file
function readFromJson(fname) {
  return JSON.parse(fs.readFileSync(fname));
}

function writeToIpfs(node, fname) {
  return new Promise((resolve, reject) => {
    node.files.add({
      path: fname,
      content: fs.readFileSync(fname),
    }, (err, result) => {
      console.log(`${fname} written. err is ${err}, result is ${JSON.stringify(result)}`);
      if (err) {
        reject(err);
      } else {
        resolve(result[0]);
      }
    });
  });
}

/** takes a number string as input and decodes it to BN. Default alphabet is that of base58 (ipfs flavor) */
function decodeToBN(inStr, _alphabet) {
  const alphabet = _alphabet || '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'; // strange enough, some base58 libs have the order of upper and lower case chars inverted
  const radixBN = new web3.utils.BN(alphabet.length);
  // console.log(`processing ${inStr} with ${[ ...inStr ].length} chars, radix ${radixBN.toString()}`);
  return [ ...inStr ].map(ch => alphabet.indexOf(ch))
    .reduce((acc, digit) => acc.mul(radixBN).add(new web3.utils.BN(digit)), new web3.utils.BN(0)); // acc * radix + digit
}

function writeGameStatesToBlockchain(contract, states) {
  const stateHashes = states.map(e => e.state);
  const boardHashes = states.map(e => `0x${e.board}00000000000000000000000`);
  contract.methods.addGames(stateHashes, boardHashes).estimateGas().then((gasEstimate) => {
    const gasLimit = gasEstimate + Math.round(gasEstimate * 0.1); // estimate + 10%
    contract.methods.addGames(stateHashes, boardHashes).send({ gas: gasLimit })
      .once('transactionHash', (txHash) => {
        console.log(`tx ${txHash} sent with gasLimit ${gasLimit} and ${stateHashes.length} entries`);
      });
  });
}

function usageExit() {
  console.error(`
usage: ${process.argv[1]} db2json | json2ipfs <path> | board2hex <board array> | ipfs2hex <ipfs hash> \
| states2blockchain <file> | states2ipfslist <infile> <outfile>
ENV variables used:
  MONGO_DB_NAME (required for db2json)
  ETH_NODE (fallback: Web3.provider)
  ETH_STATE_ADDR (fallback: ?)
  ETH_ACCOUNT (fallback: 0xFe4E89f620a8663d03136bee040904fe3A623f5D)
  ETH_GASPRICE_GWEI (fallback: 1 Gwei. Can also be a floating point number, e.g. 0.3)
`);
  process.exit(1);
}

// ========== MAIN ==========

switch (process.argv[2]) {
  case 'db2json':
    if (!process.env.MONGO_DB_NAME) {
      usageExit();
    }
    dbToJsonFiles('gameStates').then(() => {
      console.log('all done');
      process.exit(0);
    });
    break;
  case 'json2ipfs':
    initIpfs().then((node) => {
      // const gameState = readFromJson(fname);
      return writeToIpfs(node, process.argv[3]);
    }).then((meta) => {
      // since ipfs uses multihash, we cut away the first 2 bytes (+2 chars for the 0x prefix)
      const hexHash = `0x${web3.utils.toHex(decodeToBN(meta.hash)).slice(6)}`;
      console.log(`IPFS added ${meta.path} with size ${meta.size}. b58 hash: ${meta.hash}, hexHash: ${hexHash}`);
    });
    break;
  case 'board2hex': {
    const boardArr = JSON.parse(fs.readFileSync(process.argv[3])).finalBoard;
    const boardHex = boardArrToHex(boardArr);
    console.log(`result: ${boardHex}`);
    break;
  }
  case 'ipfs2hex': {
    const ipfsHash = process.argv[3];
    const hexHash = `0x${web3.utils.toHex(decodeToBN(ipfsHash)).slice(6)}`;
    console.log(`result: ${hexHash}`);
    break;
  }
  case 'states2blockchain': {
    const fname = process.argv[3];
    const states = JSON.parse(fs.readFileSync(fname));
    ethInit().then((contract) => {
      writeGameStatesToBlockchain(contract, states);
    });
    break;
  }
  case 'states2ipfslist': {
    const infname = process.argv[3];
    const outfname = process.argv[4];
    const states = JSON.parse(fs.readFileSync(infname));
    const html = states.map(e => `<a href="https://ipfs.io/ipfs/${e.ipfs}">${e.ipfs}</a>`)
      .reduce((doc, line) => `${doc}${line} <br />\n`, '')
    fs.writeFileSync(outfname, html);
    break;
  }
  default:
    usageExit();
}
