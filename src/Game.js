import GameSettings from '../frontend/src/GameSettings';

// Keeps track of Game data and timing
// Times are stored in milliseconds, since we only need relative temporal distances
// Note: Care needs to be taken to account for differences in the back-end
//       and front-end clocks to display the correct temporal distance from game start
class Game {
  constructor(io) {
    this.io = io;
    this.boardSize = GameSettings.BOARD_SIZE;
    this.startGame();
  }

  startGame() {
    this.startTime = Date.now();
  }
}

export default Game;
