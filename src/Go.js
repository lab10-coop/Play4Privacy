import GameSettings from '../frontend/src/GameSettings';

// Main interface to the Go game
class Go {
  constructor() {
    this.boardSize = GameSettings.BOARD_SIZE;
    this.boardSizeSquared = GameSettings.BOARD_SIZE * GameSettings.BOARD_SIZE;
  }
  validMove(idx) {
    if (idx >= 0 && idx < this.boardSizeSquared) {
      return true;
    }

    return false;
  }
}

export default Go;
