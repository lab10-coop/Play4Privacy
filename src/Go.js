import gs from '../frontend/src/GameSettings';
import WGo from './wgo/wgo';

function wgoToP4P(value) {
  if (value === -1) {
    return 'WHITE';
  } else if (value === 1) {
    return 'BLACK';
  }
  return '';
}

function idxToWGo(idx) {
  const x = Math.floor(idx / gs.BOARD_SIZE);
  const y = Math.floor(idx % gs.BOARD_SIZE);
  return [ x, y ];
}

function WGoToIdx(x, y) {
  // x is the vertical axis!!
  return y + (x * gs.BOARD_SIZE);
}

// Main interface to the Go game
class Go {
  constructor() {
    this.wgo = new WGo(gs.BOARD_SIZE, 'NONE');
    this.clearBoard();
  }

  get board() {
    return this.wgo.getPosition().schema.map(wgoToP4P);
  }

  clearBoard() {
    this.wgo.firstPosition();
  }

  fieldValue(idx) {
    return wgoToP4P(this.wgo.getPosition().schema[idx]);
  }

  currentTeam() {
    return this.wgo.turn === 1 ? 'BLACK' : 'WHITE';
  }

  validMove(idx) {
    const coord = idxToWGo(idx);
    return this.wgo.isValid(coord[0], coord[1]);
  }

  addMove(idx) {
    const coord = idxToWGo(idx);
    const captured = this.wgo.play(coord[0], coord[1]);
    if (Array.isArray(captured)) {
      return captured.map(value => WGoToIdx(value.x, value.y));
    }
    return captured;
  }

  // Returns a random, but valid, move
  // Warning: May return "undefined" if no valid move is left
  getRandomMove() {
    const validMoves = this.wgo.getPosition().schema.reduce((acc, val, idx) => {
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
