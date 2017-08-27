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

// Temporary solution to identify the user uniquely
// To be replaced by cryptographic tokens
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    // Note "|0" converts a Number to an integer
    const r = Math.random() * 16 | 0; // eslint-disable-line no-bitwise
    const v = c === 'x' ? r : (r & 0x3 | 0x8); // eslint-disable-line no-bitwise,no-mixed-operators
    return v.toString(16);
  });
}

class Game {
  constructor(socket) {
    // todo: Use a real token
    this.id = uuidv4();

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

    // Get notified when a roun finished
    socket.on('round finished', (newTeam, move, captured) => {
      this.squares[move] = this.currentTeam;
      this.currentTeam = newTeam;
      this.myMove = '';
      if (Array.isArray(captured)) {
        for (const piece of captured) {
          this.squares[piece] = gs.UNSET;
        }
      }
    });

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
  finishGame() {
    this.gameState = gs.PAUSED;
    this.startTime = Date.now();
  }

  // Ticker triggering updates of time-dependent computations by the magic
  // of mobx functional-reactive programming.
  @observable localTime = 0;

  @observable startTime = 0;
  @observable currentTeam = gs.UNSET;
  @observable myTeam = gs.UNSET;
  @observable myMove = '';
  @observable squares = Array(gs.BOARD_SIZE_SQUARED).fill(gs.UNSET);
  @observable countSteps = 0;

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

  @action.bound
  joinGame() {
    if (this.gameState === gs.PAUSED) {
      return;
    }
    this.socket.emit('join game', this.id, myTeam => (this.myTeam = myTeam));
  }

  @action.bound
  submitMove(move) {
    if (this.gameState === gs.PAUSED) {
      return;
    }
    this.socket.emit('submit move', this.id,
      move, (confirmedMove) => {
        this.myMove = confirmedMove;
      });
  }
}

export default Game;
