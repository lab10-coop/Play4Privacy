/*!
 * Copyright (c) 2017 David Forstenlechner
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons
 * to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import gs from '../frontend/src/GameSettings';
import ServerApi from './api';
import Go from './Go';
import findConsensus from './consensus';
import Blockchain from './Blockchain';
import PlayerData, { PlayedGame, EmailWallet, TokenClaim } from './Models';
import DatabaseWrapper, { DatabaseWrapperDummy, connectToDb } from './Database';

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
    this.pauseStart = Date.now();
    this.gameState = gs.PAUSED;
    this.currentGame = new PlayedGame({
      startDate: new Date(),
    });

    if (mongodbName !== '') {
      this.db = new DatabaseWrapper();
      connectToDb(`mongodb://mongo:27017/${mongodbName}`, () => {
        this.startGame();
        console.log('Database connected!');
      }, () => {
        console.log('Database disconnected!');
      }, () => {
        console.log('Database reconnected!');
      });
    } else {
      this.db = new DatabaseWrapperDummy();
      this.startGame();
    }

    if (process.env.ETH_ON) {
      this.blockchain = new Blockchain(() => {
        console.log('Blockchain connected');
      });
    }

    setInterval(() => this.updateTime(), 1000);
  }

  startTime() {
    return this.currentGame.startDate.getTime();
  }

  updateTime() {
    if (this.gameState === gs.PAUSED) {
      if ((Date.now() - this.pauseStart) > gs.PAUSE_DURATION) {
        this.startGame();
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
    this.roundNr = 1;
    this.currentGame = new PlayedGame({
      startDate: new Date(),
    });
    this.gameState = gs.RUNNING;
    this.api.gameStarted(this.go.currentTeam(), this.currentGame.startDate);
    console.log(`starting new game at ${new Date(this.startTime()).toLocaleString()}`);
  }

  endRound() {
    let roundMove = findConsensus(this.roundMoves).move;
    if (roundMove === undefined) {
      // Todo: Handle the case where there is no valid move left
      //       and this function returns undefined.      
      roundMove = this.go.getRandomMove();
    }
    const roundNr = this.roundNr++;
    const captured = this.go.addMove(roundMove);
    this.roundMoves.clear();
    this.currentGame.selectedMoves.push(roundMove);
    this.api.roundFinished(roundNr, this.go.currentTeam(), roundMove, captured);
  }

  endGame() {
    this.pauseStart = Date.now();
    this.gameState = gs.PAUSED;
    console.log(`game ended at ${new Date().toLocaleString()} after ${this.roundNr} rounds and with ${this.currentGame.submittedMoves.length} user submitted moves`);
    this.api.gameFinished(gs.PAUSE_DURATION);

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
    const tokenReceivers = [ ...this.players ].map(elem =>
      ({ address: elem[0], amount: elem[1].validMoves }))
      .filter(elem => elem.amount > 0);
    console.log(`tokenReceivers: ${JSON.stringify(tokenReceivers)}`);
    const endState = {
      startTime: this.startTime(),
      board: this.go.board,
      submittedMoves: this.currentGame.submittedMoves,
    };
    console.log(`endState: ${JSON.stringify(endState)}`);
    if (process.env.ETH_ON) {
    this.blockchain.persistGame(endState, tokenReceivers,
      (txHash, success) => {
        console.log(`Blockchain transaction ${txHash} ${success ? 'succeeded' : 'failed'}`);
      });
    }
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
    const numPlayers = [ ...this.players ].reduce((counts, elem) => {
      (elem[1].team === gs.BLACK) ? (counts[0] += 1) : (counts[1] += 1);
      return counts;
    }, [ 0, 0 ]);
    this.api.sendGameUpdates(numPlayers);
  }

  get expectedTeam() {
    // No need to store the current team,
    // calculate it from the current time and the round time on the fly.
    return (Math.floor((Date.now() - this.startTime()) /
      gs.ROUND_TIME) % 2) ? gs.WHITE : gs.BLACK;
  }

  joinGame(id) {
    console.log(`player ${id} connected`);
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
    console.log(`new move submitted: player ${id}, round ${round}, move ${move}, sig ${sig}`);
    if (process.env.ETH_ON) {
      /* check disabled because currently not working
      if (!this.blockchain.isSignatureValid(id, sig)) {
        console.error(`invalid signature ${sig}`);
        return 'Invalid signature';
      }
      */
    }

    // Check if user has joined the current game
    if (!this.players.has(id)) {
      return 'Join the Game first!';
    }

    // Check if player is on the right team
    if (this.players.get(id).team !== this.go.currentTeam()) {
      return 'Wait for your turn!';
    }

    // Check if already set a move in this round
    if (this.roundMoves.has(id)) {
      return this.roundMoves.get(id);
    }

    if (!this.go.validMove(move)) {
      return 'Invalid Move!';
    }

    // Set the move and return
    this.roundMoves.set(id, move);
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
      return this.roundMoves.get(id);
    }
    return '';
  }

  claimTokens(id, donate) {
    const now = new Date();
    console.log(`claim tokens by ${id} at ${now}, donate ${donate}`);
    const tokenClaim = new TokenClaim({
      userId: id,
      donate: donate,
      date: now
    });
    tokenClaim.save((err) => {
      if (err) {
        console.error(`database saving error: ${err}`);
      } else {
        console.log('successfully persisted claimTokens!');
      }
    });
  }

  sendWalletByEmail(id, email, keystore) {
    console.log(`persisting emailWallet ${id}, ${email}, ${keystore}`);
    const emailWallet = new EmailWallet({
      userId: id,
      email: email,
      wallet: keystore
    });
    emailWallet.save((err) => {
      if (err) {
        console.error(`database saving error: ${err}`);
      } else {
        console.log('successfully persisted emailWallet!');
      }
    });
  }
}

export default Game;
