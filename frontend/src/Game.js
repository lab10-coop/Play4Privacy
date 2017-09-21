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

import { observable, computed, action } from 'mobx';
import gs from './GameSettings';
import ethUtils from './EthereumUtils';

// TODO: remove (for debugging only)
window.eth = ethUtils;
window.web3 = ethUtils.web3;

class Game {
  constructor(socket) {
    // todo: Use a real token
    this.id = ethUtils.loadWallet();

    this.socket = socket;
    this.maxGameDuration = new Date(gs.MAX_GAME_DURATION);
    this.gameState = gs.RUNNING;

    // Acquire the current game state
    socket.emit('current game state', this.id, this.refreshGameState);

    // ////////////////////////////////////////////////////////////////////////
    // Subscriptions to socket.io Events

    // Re-acqure the current game state on a re-connect
    socket.on('connect', () =>
      this.socket.emit('current game state', this.id, this.refreshGameState));

    // Get notified when a new game started
    this.socket.on('game started', this.startGame);

    // Get notified when a new game started
    this.socket.on('game finished', this.finishGame);

    // Get notified when a round finished
    socket.on('round finished', this.finishRound);

    // For continuous game changes
    this.socket.on('game updates', this.updateGame);

    // ////////////////////////////////////////////////////////////////////////    

    // Initialize the ticker to the current time in the browser
    // Note: local browser time may differ from the time sent by the server,
    //       we need to compensate for that fact.
    this.localTime = Date.now();
    // Triggers a refresh of time-dependent values once per second
    // by updating the "localTime" ticker, which itself is an observable
    // and will trigger events by functions using it if they are use
    // mobx's "@compute" decorator.
    setInterval(() => { this.localTime = Date.now(); }, 1000);
  }

  @action.bound
  startGame(startTime, currentTeam) {
    this.gameState = gs.RUNNING;
    this.refreshGameState(startTime, startTime, currentTeam, gs.UNSET, '',
      Array(gs.BOARD_SIZE_SQUARED).fill(gs.UNSET), gs.RUNNING);
  }

  @action.bound
  refreshGameState(serverTime, startTime, currentTeam, myTeam, myMove, boardState, gameState) {
    const offset = Date.now() - serverTime;
    for (let i = 0; i < gs.BOARD_SIZE_SQUARED; i++) {
      this.squares[i] = boardState[i];
    }
    this.startTime = startTime + offset;
    this.currentTeam = currentTeam;
    this.myTeam = myTeam;
    this.myMove = myMove;
    this.gameState = gameState;
  }

  @action.bound
  finishRound(nr, newTeam, move, captured) {
    this.roundNr = nr + 1; // point to the next round
    this.squares[move] = this.currentTeam;
    this.currentTeam = newTeam;
    if(this.myMove !== "" && ! isNaN(this.myMove)) {
        this.earnedTokens++;
    }
    this.myMove = '';
    if (Array.isArray(captured)) {
      for (const piece of captured) {
        this.squares[piece] = gs.UNSET;
      }
    }
  }

  @action.bound
  finishGame() {
    this.gameState = gs.PAUSED;
    this.startTime = Date.now();
  }

  @action.bound
  updateGame(numPlayers) {
    this.blackPlayers = numPlayers[0];
    this.whitePlayers = numPlayers[1];
  }

  // Ticker triggering updates of time-dependent computations by the magic
  // of mobx functional-reactive programming.
  @observable localTime = 0;

  @observable startTime = 0;
  @observable currentTeam = gs.UNSET;
  @observable roundNr = 1;
  @observable myTeam = gs.UNSET;
  @observable myMove = '';
  @observable earnedTokens = 0;
  @observable squares = Array(gs.BOARD_SIZE_SQUARED).fill(gs.UNSET);
  @observable countSteps = 0;
  @observable blackPlayers = 0;
  @observable whitePlayers = 0;
  @observable gameState = gs.PAUSED;


  // Computes the time left in the current game
  // Returns a "Date" type for convenience of extraction of Minutes and Seconds.
  // Note: Relies on "this.localTime" to be changed periodically to automatically
  //       trigger updates in code that uses this function.
  @computed get timeLeftInGame() {
    const duration = Math.max(0, (gs.MAX_GAME_DURATION -
      (this.localTime - this.startTime)));
    return new Date(duration);
  }

  @computed get timeLeftInRound() {
    let duration = Math.max(0, (gs.MAX_GAME_DURATION -
      (this.localTime - this.startTime)));
    duration = Math.floor(duration % gs.ROUND_TIME);
    return new Date(duration);
  }

  @computed get timeLeftInPause() {
    const duration = Math.max(0, (gs.PAUSE_DURATION -
      (this.localTime - this.startTime)));
    return new Date(duration);
  }

  @computed get formattedMove() {
    if (this.myMove === '' || isNaN(this.myMove)) {
      return this.myMove;
    }
    return gs.idxToCoord(this.myMove);
  }

  @computed get formattedMyTeam() {
    return gs.teamToString(this.myTeam);
  }

  @computed get formattedCurrentTeam() {
    return gs.teamToString(this.currentTeam);
  }

  @computed get currentTeamPlayers() {
    if (this.myTeam === gs.BLACK) {
      return this.blackPlayers;
    } else if (this.myTeam === gs.WHITE) {
      return this.whitePlayers;
    }
    return '--';
  }

  @computed get percentageLeftinGame() {
    return `${((this.timeLeftInGame.getTime() / this.maxGameDuration.getTime()) * 100)}%`;
  }

  @computed get percentageLeftinRound() {
    return `${((this.timeLeftInRound.getTime() / gs.ROUND_TIME) * 100)}%`;
  }

  @computed get myTeamActive() {
    return this.myTeam === this.currentTeam;
  }
  
  @computed get paused() {
    return this.gameState === gs.PAUSED;
  }

  @action.bound
  joinGame() {
    if (this.gameState === gs.PAUSED) {
      return;
    }
    this.earnedTokens = 0;
    this.socket.emit('join game', this.id, myTeam => (this.myTeam = myTeam));
  }

  @action.bound
  submitMove(move) {
    if (this.gameState === gs.PAUSED) {
      return;
    }

    const sig = ethUtils.sign(`${this.startTime}_${this.roundNr}_${move}`);

    this.socket.emit('submit move', this.id,
      move, sig, (confirmedMove) => {
        this.myMove = confirmedMove;
        this.squares[confirmedMove] = gs.PLACED;
      });
  }
}

export default Game;
