import GameSettings from '../frontend/src/GameSettings';

// Main interface to the Go game
class Go {
  constructor() {
    this.boardSize = GameSettings.BOARD_SIZE;
    this.boardSizeSquared = GameSettings.BOARD_SIZE * GameSettings.BOARD_SIZE;
    this.board = new Array(this.boardSizeSquared);
    this.numMoves = 0;
    this.clearBoard();
  }

  clearBoard() {
    this.board.fill('');
  }

  fieldValue(idx) {
    return this.board[idx];
  }

  currentTeam() {
    return (this.numMoves % 2) ? 'BLACK' : 'WHITE';
  }

  validMove(idx) {
    // Check bounds
    if (idx < 0 || idx >= this.boardSizeSquared) {
      return false;
    }

    // Check if already set
    if (this.board[idx]) {
      return false;
    }

    return true;
  }

  addMove(idx) {
    if (!this.validMove(idx)) {
      return false;
    }

    this.board[idx] = this.currentTeam();
    this.numMoves += 1;
    return true;
  }

  // Returns a random, but valid, move
  // Warning: May return "undefined" if no valid move is left
  addRandomMove() {
    const validMoves = this.board.reduce((acc, val, idx) => {
      if (this.validMove(idx)) {
        acc.push(idx);
      }
      return acc;
    }, []);

    if (validMoves.length === 0) {
      return undefined;
    }

    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }
}

export default Go;
