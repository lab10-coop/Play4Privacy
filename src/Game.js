import GameSettings from '../frontend/src/GameSettings';
import ServerApi from './api';

// Keeps track of Game data and timing
// Times are stored in milliseconds, since we only need relative temporal distances
// Note: Care needs to be taken to account for differences in the back-end
//       and front-end clocks to display the correct temporal distance from game start
class Game {
  constructor(io) {
    this.api = new ServerApi(io);
    this.boardSize = GameSettings.BOARD_SIZE;
    this.players = new Map();
    this.roundMoves = new Map();

    setInterval(() => this.updateTime(), 1000);
    this.startGame();
  }

  updateTime() {
    if ((Date.now() - this.startTime) > GameSettings.MAX_GAME_DURATION) {
      this.startGame();
    } else {
      const nextTeam = this.currentTeam;
      if (this.previousTeam !== nextTeam) {
        this.previousTeam = nextTeam;
        this.api.roundFinished(nextTeam);
      }
    }
  }

  startGame() {
    this.startTime = Date.now();
    this.previousTeam = 'WHITE';
    this.api.startGame(this.startTime, this.currentTeam);
  }

  get currentTeam() {
    // No need to store the current team,
    // calculate it from the current time and the round time on the fly.
    return (Math.floor((Date.now() - this.startTime) /
      GameSettings.ROUND_TIME) % 2) ? 'BLACK' : 'WHITE';
  }

  joinGame(id) {
    if (!this.players.has(id)) {
      // assign teams round-robin
      this.players.set(id, this.players.size % 2 ? 'BLACK' : 'WHITE');
    }
    return this.players.get(id);
  }

  hasJoined(id) {
    return this.players.has(id) ? this.players.get(id) : '';
  }

  playerMove(id) {
    if (this.roundMoves.has(id)) {
      return this.roundMoves.get(id);
    }
    return '';
  }
}

export default Game;
