function GameSettings() {
  this.BOARD_SIZE = 9;
  this.BOARD_SIZE_SQUARED = this.BOARD_SIZE * this.BOARD_SIZE;
  this.ONE_SECOND = 1000;
  this.ONE_MINUTE = this.ONE_SECOND * 60;
  this.MAX_GAME_DURATION = 2 * this.ONE_MINUTE;
  this.ROUND_TIME = 10 * this.ONE_SECOND;

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
}

const gameSettings = new GameSettings();

// Old-school module export since this file is shared with the back-end
// and not processed by Babel
module.exports = gameSettings;
