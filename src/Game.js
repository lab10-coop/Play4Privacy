import GameSettings from '../frontend/src/GameSettings';

// Keeps track of Game data and timing
// Times are stored in milliseconds, since we only need relative temporal distances
// Note: Care needs to be taken to account for differences in the back-end
//       and front-end clocks to display the correct temporal distance from game start
class Game {
  constructor(io) {
    this.io = io;
    this.boardSize = GameSettings.BOARD_SIZE;
    setInterval(() => this.updateTime(), 1000);
    this.startGame();
  }

  updateTime() {
    if ((Date.now() - this.startTime) > GameSettings.MAX_GAME_DURATION) {
      console.log('Game time finished!');
      this.startGame();
    }
  }

  startGame() {
    this.startTime = Date.now();
    this.io.emit('start game', this.startTime);
  }
}

export default Game;
