import { observable, computed, action } from 'mobx';
import GameSettings from './GameSettings';

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
    this.boardSize = GameSettings.BOARD_SIZE;
    this.maxGameDuration = new Date(GameSettings.MAX_GAME_DURATION);

    // Acquire the current game state
    socket.emit('current game state', this.id, this.refreshGameState);

    // ////////////////////////////////////////////////////////////////////////
    // Subscriptions to socket.io Events

    // Re-acqure the current game state on a re-connect
    socket.on('connect', () =>
      this.socket.emit('current game state', this.id, this.refreshGameState));

    // Get notified when a new game started
    this.socket.on('game started', this.startGame);

    // Get notified when a roun finished
    socket.on('round finished', (newTeam) => {
      this.currentTeam = newTeam;
      this.myMove = '';
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
    this.refreshGameState(startTime, startTime, currentTeam, '', '');
  }

  @action.bound
  refreshGameState(serverTime, startTime, currentTeam, myTeam, myMove) {
    const offset = Date.now() - serverTime;
    this.startTime = startTime + offset;
    this.currentTeam = currentTeam;
    this.myTeam = myTeam;
    this.myMove = myMove;
  }

  // Ticker triggering updates of time-dependent computations by the magic
  // of mobx functional-reactive programming.
  @observable localTime = 0;

  @observable startTime = 0;
  @observable currentTeam = '';
  @observable myTeam = '';
  @observable myMove = '';
  @observable squares = Array(this.boardSize * this.boardSize).fill(null);
  @observable countSteps = 0;

  // Computes the time left in the current game
  // Returns a "Date" type for convenience of extraction of Minutes and Seconds.
  // Note: Relies on "this.localTime" to be changed periodically to automatically
  //       trigger updates in code that uses this function.
  @computed get timeLeftInGame() {
    const duration = Math.max(0, (GameSettings.MAX_GAME_DURATION -
      (this.localTime - this.startTime)));
    return new Date(duration);
  }

  @computed get timeLeftInRound() {
    let duration = Math.max(0, (GameSettings.MAX_GAME_DURATION -
      (this.localTime - this.startTime)));
    duration = Math.floor(duration % GameSettings.ROUND_TIME);
    return new Date(duration);
  }

  @computed get formattedMove() {
    if (this.myMove === '' || isNaN(this.myMove)) {
      // console.log('Move Rejected');
      return this.myMove;
    }
    // console.log(`Formatting Move: ${this.myMove}`);
    return GameSettings.idxToCoord(this.myMove);
  }

  @action.bound
  joinGame() {
    this.socket.emit('join game', this.id, myTeam => (this.myTeam = myTeam));
  }

  @action.bound
  submitMove(move) {
    // console.log(`Submitting Move: ${move}`);
    this.socket.emit('submit move', this.id,
      move, (confirmedMove) => {
        // console.log(`Confirmed Move: ${confirmedMove}`);
        this.myMove = confirmedMove;
      });
  }
}

export default Game;
