function GameSettings() {
  this.BOARD_SIZE = 9;
  this.BOARD_SIZE_SQUARED = this.BOARD_SIZE * this.BOARD_SIZE;

  this.ONE_SECOND = 1000;
  this.ONE_MINUTE = this.ONE_SECOND * 60;
  this.MAX_GAME_DURATION = 2 * this.ONE_MINUTE;
  this.ROUND_TIME = 10 * this.ONE_SECOND;
  this.PAUSE_DURATION = 10 * this.ONE_SECOND;

  // Game states
  this.PAUSED = 0;
  this.RUNNING = 1;

  // Field states
  this.BLACK = 1;
  this.WHITE = -1;
  this.UNSET = 0;
  this.PLACED = 2;


  // WGo error codes
  this.ERROR_ALREADY_OCCUPIED = 2;
  this.ERROR_SUICIDE = 3;

  this.idxToCoord = (idx) => {
    let column = idx % this.BOARD_SIZE;
    const row = this.BOARD_SIZE - Math.floor(idx / this.BOARD_SIZE);
    // Special case, we skip 'I' and continue with 'J' instead
    if (column > 7) {
      column += 1;
    }
    return String.fromCharCode('A'.charCodeAt(0) + column) + row.toString();
  };

  this.teamToString = (team) => {
    if (team === this.BLACK) {
      return 'BLACK';
    } else if (team === this.WHITE) {
      return 'WHITE';
    }
    return '';
  };
}

const gameSettings = new GameSettings();

// Old-school module export since this file is shared with the back-end
// and not processed by Babel
module.exports = gameSettings;
