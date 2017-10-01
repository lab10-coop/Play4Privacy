/* eslint func-names: ["error", "never"] */
function GameSettings() {
  this.BOARD_SIZE = 9;
  this.BOARD_SIZE_SQUARED = this.BOARD_SIZE * this.BOARD_SIZE;

  this.ONE_SECOND = 1000;
  this.ONE_MINUTE = this.ONE_SECOND * 60;

//  this.MAX_GAME_DURATION = 10 * this.ONE_SECOND;
//  this.ROUND_TIME = 10 * this.ONE_SECOND;
//  this.PAUSE_DURATION = 5 * this.ONE_SECOND;
  this.MAX_GAME_DURATION = 20 * this.ONE_MINUTE;
  this.ROUND_TIME = 20 * this.ONE_SECOND;
  this.PAUSE_DURATION = 20 * this.ONE_SECOND;

  // Game states
  this.STOPPED = 2;
  this.PAUSED = 0;
  this.RUNNING = 1;

  // Game limits
  this.MAX_PLAYERS = 100;

  // Field/team states
  this.BLACK = 1;
  this.WHITE = -1;
  this.UNSET = 0;
  this.PLACED = 2;
  this.PLAYER_LIMIT_EXCEEDED = -2;

  this.inDebugMode = function() {
    return (location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.hostname === "::1" || location.hostname === "staging-p4p.dev.lab10.io");  // eslint-disable-line no-restricted-globals
  };

  this.getBixcamUrl = function() {
    if(this.inDebugMode()) {
      return "http://play-test.p4p.lab10.io/bixcam";
    } else {
      return `${location.origin}/bixcam`; // eslint-disable-line no-restricted-globals
    }
  };

  // WGo error codes
  this.ERROR_ALREADY_OCCUPIED = 2;
  this.ERROR_SUICIDE = 3;

  this.idxToCoord = function (idx) {
    let column = idx % this.BOARD_SIZE;
    const row = this.BOARD_SIZE - Math.floor(idx / this.BOARD_SIZE);
    // Special case, we skip 'I' and continue with 'J' instead
    if (column > 7) {
      column += 1;
    }
    return String.fromCharCode('A'.charCodeAt(0) + column) + row.toString();
  };

  this.teamToString = function (team) {
    if (team === this.BLACK) {
      return 'BLACK';
    } else if (team === this.WHITE) {
      return 'WHITE';
    } else if (team === this.PLAYER_LIMIT_EXCEEDED) {
      return 'Maximum Users Exceeded!';
    }
    return '';
  };


  // Blockchain stuff
  this.bcExplorerBaseUrl = "https://etherscan.io";
  this.bcTokenContractAddr = "0xfB41f7b63c8e84f4BA1eCD4D393fd9daa5d14D61";
}

const gameSettings = new GameSettings();

// Old-school module export since this file is shared with the back-end
// and not processed by Babel
module.exports = gameSettings;
