function GameSettings() {
  this.BOARD_SIZE = 9;
  this.ONE_SECOND = 1000;
  this.ONE_MINUTE = this.ONE_SECOND * 60;
  this.MAX_GAME_DURATION = 4 * this.ONE_MINUTE;
  this.ROUND_TIME = 20 * this.ONE_SECOND;
}

const gameSettings = new GameSettings();

// Old-school module export since this file is shared with the back-end
// and not processed by Babel
module.exports = gameSettings;
