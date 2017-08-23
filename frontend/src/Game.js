import { observable, computed, action } from 'mobx';
import GameSettings from './GameSettings';

class GameState {
  constructor(socket) {
    this.socket = socket;
    this.boardSize = GameSettings.BOARD_SIZE;
    this.maxGameDuration = new Date(GameSettings.MAX_GAME_DURATION);

    // Acquire the current game state
    socket.emit('current game state', this.refreshGameState);

    // ////////////////////////////////////////////////////////////////////////
    // Subscriptions to socket.io Events

    // Re-acqure the current game state on a re-connect
    socket.on('connect', () =>
      this.socket.emit('current game state', this.refreshGameState));

    // Get notified when a new game starts
    this.socket.on('start game', this.startGame);

    // Get notified 
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
    this.refreshGameState(startTime, startTime, currentTeam);
  }

  @action.bound
  refreshGameState(serverTime, startTime, currentTeam) {
    const offset = Date.now() - serverTime;
    this.startTime = startTime + offset;
    this.currentTeam = currentTeam;
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

  @computed get whiteIsNext() {
    return (this.countSteps % 2) === 0;
  }

  @action.bound putStone(idx) {
    if (!this.squares[idx]) {
      this.squares[idx] = this.whiteIsNext ? 'white' : 'black';
      this.countSteps += 1;
    }
  }
}

export default GameState;
