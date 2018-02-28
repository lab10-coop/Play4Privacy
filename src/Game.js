import fs from 'fs';
import gs from '../frontend/src/GameSettings';
import ServerApi from './api';
import Go from './Go';
import findConsensus from './consensus';
import PlayerData, { PlayedGame, EmailWallet, Token } from './Models';
import DatabaseWrapper, { DatabaseWrapperDummy, connectToDb } from './Database';
import ethCrypto from './EthCrypto';

// Keeps track of Game data and timing
// Times are stored in milliseconds, since we only need relative temporal distances
// Note: Care needs to be taken to account for differences in the back-end
//       and front-end clocks to display the correct temporal distance from game start
class Game {
  constructor(io, mongodbName) {
    this.api = new ServerApi(io);
    this.go = new Go();
    this.players = new Map();
    this.roundMoves = new Map();
    this.roundInvalidMoves = new Map();
    this.nrCaptured = new Map();
    this.nrValidMoves = 0; // counts the valid moves proposed
    this.tokens = [];
    this.pauseStart = Date.now();
    this.gameState = gs.PAUSED;
    const now = new Date();
    this.currentGame = new PlayedGame({
      gameId: Math.floor(now.getTime() / 1000),
      startDate: now,
    });
    // misbehaving players are put on a blacklist, reconnection attempts blocked for the game in progress
    this.blacklist = {
      list: new Set(),
      add(id) {
        this.list.add(id);
      },
      contains(id) { return this.list.has(id); },
      reset() { this.list.clear(); },
    };

    this.readyForConnections = new Promise((resolve) => {
      if (mongodbName !== '') {
        this.db = new DatabaseWrapper();
        connectToDb(`mongodb://mongo:27017/${mongodbName}`, () => {
          console.log('Database connected!');
          this.loadTokens(() => {
            this.conditionalStartGame();
            resolve();
          });
        }, () => {
          console.log('Database disconnected!');
        }, () => {
          console.log('Database reconnected!');
        });
      } else {
        this.db = new DatabaseWrapperDummy();
        console.log('NOTE: in DB dummy mode unclaimed tokens will be reset on server restart!');
        this.conditionalStartGame();
        resolve();
      }
    });

    setInterval(() => this.updateTime(), 1000);
  }

  // loads token state from DB into instance field
  loadTokens(callback) {
    console.log('loading tokens from DB...');
    this.db.getAllTokens().then((allTok) => {
      this.tokens = allTok;
      if (callback) {
        callback();
      }
    });
  }

  startTime() {
    return this.currentGame.startDate.getTime();
  }

  gameId() {
    return this.currentGame.gameId;
  }

  conditionalStartGame() {
    if (!fs.existsSync('game_stopped')) {
      this.startGame();
    } else {
      this.api.gameStopped();
    }
  }

  getTokenEntryOf(id) {
    let te = this.tokens.find(t => t.userId === id);
    if (!te) {
      console.log(`creating new tokens entry for ${id}`);
      te = new Token({
        userId: id,
        unclaimed: 0,
        redeemed: 0,
        donated: 0,
      });
      this.tokens.push(te);
    }
    return te;
  }

  getUnclaimedTokensOf(id) {
    return this.getTokenEntryOf(id).unclaimed;
  }

  updateTime() {
    if (this.gameState === gs.PAUSED) {
      if ((Date.now() - this.pauseStart) > gs.PAUSE_DURATION) {
        this.conditionalStartGame();
      }
    } else if ((Date.now() - this.startTime()) > gs.MAX_GAME_DURATION) {
      this.endRound();
      this.endGame();
    } else if (this.go.currentTeam() !== this.expectedTeam) {
      this.endRound();
    } else {
      this.sendGameUpdates();
    }
  }

  startGame() {
    this.go.clearGame();
    this.players.clear();
    this.roundMoves.clear();
    this.roundInvalidMoves.clear();
    this.blacklist.reset();
    this.roundNr = 1;
    this.nrCaptured.set(gs.BLACK, 0);
    this.nrCaptured.set(gs.WHITE, 0);
    this.nrValidMoves = 0;
    const now = new Date();
    this.currentGame = new PlayedGame({
      gameId: Math.floor(now.getTime() / 1000),
      startDate: now,
    });
    this.gameState = gs.RUNNING;
    this.api.gameStarted(this.gameId(), this.go.currentTeam());
    console.log(`starting new game with id ${this.gameId()} at \
      ${new Date(this.startTime()).toLocaleString()}`);
  }

  endRound() {
    let roundMove = findConsensus(this.roundMoves).move;
    if (roundMove === undefined) {
      // Todo: Handle the case where there is no valid move left
      //       and this function returns undefined.      
      roundMove = this.go.getRandomMove();
    }
    // update tokenMap
    [...this.roundMoves.keys()].forEach(id => this.getTokenEntryOf(id).unclaimed++);
    const roundNr = this.roundNr++;
    const captured = this.go.addMove(roundMove);
    console.log(`incrementing nrCaptured for ${this.go.currentTeam()} by ${captured.length}`);
    // at this point currentTeam() already points to the next team.
    // Since we count the stones captures OF and not BY that team, that's fine.
    this.nrCaptured.set(this.go.currentTeam(),
      this.nrCaptured.get(this.go.currentTeam()) + captured.length);
    const roundMovesSize = [...this.roundMoves.values()].reduce((prev, cur) => prev + cur.length, 0);
    console.log(`incrementing nrValidMoves by ${roundMovesSize}`);
    this.nrValidMoves += roundMovesSize;
    this.roundMoves.clear();
    this.roundInvalidMoves.clear();
    this.currentGame.selectedMoves.push(roundMove);
    this.api.roundFinished(roundNr, this.go.currentTeam(), roundMove, captured);
  }

  endGame() {
    this.pauseStart = Date.now();
    this.gameState = gs.PAUSED;
    console.log(`game ended at ${new Date().toLocaleString()} after ${this.roundNr} rounds and \
      with ${this.currentGame.submittedMoves.length} user submitted moves`);
    console.log(`captured stones: black ${this.nrCaptured.get(gs.BLACK)}, white \
      ${this.nrCaptured.get(gs.WHITE)}`);
    console.log(`nr valid moves: ${this.nrValidMoves}`);
    this.api.gameFinished([...this.nrCaptured], this.nrValidMoves);

    // TODO: if needed, this could easily be optimized to only save changed entries
    // e.g. by using a dirty flag.
    this.db.persistTokens(this.tokens).then(() => {
      console.log('token state persisted');
    });

    this.currentGame.board = this.go.board;
    this.players.forEach((value, key) => {
      this.currentGame.players.push({ userId: key });
      // console.log(`Persisting player with id: ${key}`)
    });
    this.currentGame.save((err) => {
      if (err) {
        console.error(`database saving error: ${err}`);
      } else {
        console.log('successfully persisted game!');
      }
    });

    // construct an array of { address: <player id>, amount: <nr of legal moves submitted> }
    const tokenReceivers = [...this.players].map(elem =>
      ({ address: elem[0], amount: elem[1].validMoves }))
      .filter(elem => elem.amount > 0);
    console.log(`tokenReceivers: ${JSON.stringify(tokenReceivers)}`);
    const endState = {
      startTime: this.startTime(),
      board: this.go.board,
      submittedMoves: this.currentGame.submittedMoves,
    };
    console.log(`endState: ${JSON.stringify(endState)}`);
  }

  sendGameUpdates() {
    if (this.gameState === gs.PAUSED) {
      console.error('sendGameStats should *never* be called when the game is paused!');
      return;
    }
    // only send every 3rd second
    if ((new Date()).getSeconds() % 3) {
      return;
    }
    const numPlayers = [...this.players].reduce((counts, elem) => {
      (elem[1].team === gs.BLACK) ? (counts[0] += 1) : (counts[1] += 1);
      return counts;
    }, [0, 0]);
    const placedMoves = new Array(gs.BOARD_SIZE_SQUARED).fill(0);
    this.roundMoves.forEach((moves) => {
      for (const move of moves) {
        placedMoves[move] += 1;
      }
    });
    this.api.sendGameUpdates(numPlayers, placedMoves);
  }

  get expectedTeam() {
    // No need to store the current team,
    // calculate it from the current time and the round time on the fly.
    return (Math.floor((Date.now() - this.startTime()) /
      gs.ROUND_TIME) % 2) ? gs.WHITE : gs.BLACK;
  }

  // @returns the team or an error code if joining not possible or null if blacklisted
  joinGame(id) {
    if (this.blacklist.contains(id)) {
      console.log(`blocking join attempt of blacklisted ${id}`);
      return 'blacklisted';
    }

    if (!this.players.has(id)) {
      if (this.gameState === gs.PAUSED) {
        return gs.UNSET;
      }

      if (this.players.size >= gs.MAX_PLAYERS) {
        return gs.PLAYER_LIMIT_EXCEEDED;
      }

      // assign teams round-robin
      this.players.set(id, new PlayerData(this.players.size % 2 ? gs.WHITE : gs.BLACK, 0));
    }
    return this.players.get(id).team;
  }

  hasJoined(id) {
    return this.players.has(id) ? this.players.get(id).team : gs.UNSET;
  }

  submitMove(id, round, move, sig) {
    /* nested function rateLimit() implements rate limiting:
    After 3 invalid moves per round, block the player for the current round with warning message.
    If invalid moves don't stop and reach 10 per round, disconnect the player. */
    const blockRoundThresh = 3;
    const blockedMessage = 'blocked for this round';
    const kickThresh = 10;
    const rateLimit = (errMsg) => {
      this.roundInvalidMoves.set(id, this.roundInvalidMoves.get(id) + 1 || 1);
      if (this.roundInvalidMoves.get(id) >= kickThresh) {
        console.log(`rateLimit: kicking ${id}`);
        this.blacklist.add(id);
        this.players.delete(id);
        return 'disconnect';
      }
      if (this.roundInvalidMoves.get(id) >= blockRoundThresh) {
        console.log(`rateLimit: warning ${id} with count ${this.roundInvalidMoves.get(id)}`);
        return blockedMessage;
      }
      return errMsg;
    };
    const isRateLimited = () => this.roundInvalidMoves.get(id) >= blockRoundThresh;

    const logMsg = `move: player ${id}, round ${round}, move ${move}`;

    // Checks in the order of most likely failure

    // Check if already set a move in this round
    if (this.roundMoves.has(id)) {
      const playerMoves = this.roundMoves.get(id);

      if (playerMoves.indexOf(move) !== -1) {
        console.log(`${logMsg} ignored: repetition`);
        return move;
      }

      if (playerMoves.length >= 5) {
        console.log(`${logMsg} invalid: max. 5 move proposals allowed`);
        return rateLimit('Too many Votes!');
      }
    }

    if (!this.go.validMove(move)) {
      console.log(`${logMsg} invalid: illegal move`);
      return rateLimit('Invalid Move!');
    }

    // Check if user has joined the current game
    if (!this.players.has(id)) {
      console.log(`${logMsg} invalid: not joined`);
      return rateLimit('Join the Game first!');
    }

    // Check if player is on the right team
    if (this.players.get(id).team !== this.go.currentTeam()) {
      console.log(`${logMsg} invalid: wrong team`);
      return rateLimit('Wait for your turn!');
    }

    const sigData = `${this.gameId()}_${round}_${move}`;
    if (!ethCrypto.isSignatureValid(id, sigData, sig)) {
      console.log(`${logMsg} invalid: bad signature ${sig} - sigData ${sigData}`);
      return rateLimit('Invalid signature');
    }

    if (isRateLimited()) {
      console.log(`${logMsg} rate limited after ${this.roundInvalidMoves.get(id)} invalid attempts`);
      return blockedMessage;
    }
    console.log(`${logMsg} valid`);

    // Make sure we have an array to push to
    if (!this.roundMoves.has(id)) {
      this.roundMoves.set(id, []);
    }

    // Set the move and return
    this.roundMoves.get(id).push(move);
    this.players.get(id).validMoves += 1;
    this.currentGame.submittedMoves.push({
      round: this.roundNr,
      move,
      sig,
    });
    return move;
  }

  playerMove(id) {
    if (this.roundMoves.has(id)) {
      return this.roundMoves.get(id)[0];
    }
    return '';
  }

  claimTokens(id, donate) {
    const now = new Date();
    const te = this.getTokenEntryOf(id);
    console.log(`claim tokens by ${id} at ${now}, donate ${donate}. \
      Has ${te.unclaimed} unclaimed tokens`);
    if (donate) {
      te.donated += te.unclaimed;
    } else {
      te.redeemed += te.unclaimed;
    }
    te.unclaimed = 0;
    te.save((err) => {
      if (err) {
        console.error(`database saving error: ${err}`);
      }
    });
  }
}

export function sendWalletByEmail(id, email, keystore) {
  console.log(`persisting emailWallet ${id}, ${email}, ${keystore}`);
  const emailWallet = new EmailWallet({
    userId: id,
    email,
    wallet: keystore,
  });
  emailWallet.save((err) => {
    if (err) {
      console.error(`database saving error: ${err}`);
    } else {
      console.log('successfully persisted emailWallet!');
    }
  });
}

export default Game;
