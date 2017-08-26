import GameSettings from '../frontend/src/GameSettings';
import ServerApi from './api';
import Go from './Go';
import findConsensus from './consensus';

// Keeps track of Game data and timing
// Times are stored in milliseconds, since we only need relative temporal distances
// Note: Care needs to be taken to account for differences in the back-end
//       and front-end clocks to display the correct temporal distance from game start
class Game {
  constructor(io) {
    this.api = new ServerApi(io);
    this.go = new Go();
    this.players = new Map();
    this.roundMoves = new Map();

    setInterval(() => this.updateTime(), 1000);
    this.startGame();
  }

  updateTime() {
    if ((Date.now() - this.startTime) > GameSettings.MAX_GAME_DURATION) {
      this.startGame();
    } else if (this.go.currentTeam() !== this.expectedTeam) {
      this.endRound();
    }
  }

  startGame() {
    this.go.clearBoard();
    this.players.clear();
    this.roundMoves.clear();
    this.startTime = Date.now();
    this.api.gameStarted(this.startTime, this.go.currentTeam());
  }

  endRound() {
    let roundMove = findConsensus(this.roundMoves).move;
    if (roundMove === undefined) {
      // Todo: Handle the case where there is no valid move left
      //       and this function returns undefined.      
      roundMove = this.go.getRandomMove();
    }
    this.go.addMove(roundMove);
    this.roundMoves.clear();
    this.api.roundFinished(this.go.currentTeam(), roundMove);
  }

  get expectedTeam() {
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

  submitMove(id, move) {
    // Check if user has joined the current game
    if (!this.players.has(id)) {
      return 'Join the Game first!';
    }

    // Check if player is on the right team
    if (this.players.get(id) !== this.go.currentTeam()) {
      return 'Wait your turn!';
    }

    // Check if already set a move in this round
    if (this.roundMoves.has(id)) {
      return this.roundMoves.get(id);
    }

    // Set the move and return
    this.roundMoves.set(id, move);
    return move;
  }

  playerMove(id) {
    if (this.roundMoves.has(id)) {
      return this.roundMoves.get(id);
    }
    return '';
  }
}

export default Game;
