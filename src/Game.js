// Keeps track of Game data and times
// times are stored in milliseconds, 
// since we do not really care
// about dates, just time differences.
class Game {
  constructor(io) {
    this.io = io;
  }
}

export default Game;
