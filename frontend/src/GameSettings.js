function GameSettings() {
  this.BOARD_SIZE = 9;
  this.ONE_SECOND = 1000;
  this.ONE_MINUTE = this.ONE_SECOND * 60;
  this.MAX_GAME_DURATION = 4 * this.ONE_MINUTE;
  this.ROUND_TIME = 20 * this.ONE_SECOND;

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
