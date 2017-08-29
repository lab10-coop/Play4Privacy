import gs from '../frontend/src/GameSettings';
import WGo from './wgo/wgo';

function idxToWGo(idx) {
  const x = Math.floor(idx / gs.BOARD_SIZE);
  const y = Math.floor(idx % gs.BOARD_SIZE);
  return { x, y };
}

function WGoToIdx(x, y) {
  // x is the vertical axis!!
  return y + (x * gs.BOARD_SIZE);
}

// Main interface to the Go game
class Go {
  constructor() {
    this.wgo = new WGo(gs.BOARD_SIZE, 'NONE');
    this.clearGame();
  }

  get board() {
    return this.wgo.getPosition().schema;
  }

  clearGame() {
    this.wgo = new WGo(gs.BOARD_SIZE, 'NONE');
  }

  fieldValue(idx) {
    return this.board[idx];
  }

  currentTeam() {
    return this.wgo.turn === 1 ? gs.BLACK : gs.WHITE;
  }

  validMove(idx) {
    const coord = idxToWGo(idx);
    return this.wgo.isValid(coord.x, coord.y);
  }

  addMove(idx) {
    const coord = idxToWGo(idx);
    const captured = this.wgo.play(coord.x, coord.y);
    if (Array.isArray(captured)) {
      return captured.map(value => WGoToIdx(value.x, value.y));
    }
    return captured;
  }

  // Returns a random, but valid, move
  // Warning: May return "undefined" if no valid move is left
  getRandomMove() {
    const validMoves = this.board.reduce((acc, val, idx) => {
      if (this.validMove(idx)) {
        acc.push(idx);
      }
      return acc;
    }, []);

    if (validMoves.length) {
      return validMoves[Math.floor(Math.random() * validMoves.length)];
    }
    return undefined;
  }
}

export default Go;
