import { observable, computed, action } from 'mobx';
import GameSettings from './GameSettings';

class GameState {
  constructor(socket) {
    this.socket = socket;
    this.boardSize = GameSettings.BOARD_SIZE;
  }

  @observable squares = Array(this.boardSize * this.boardSize).fill(null);
  @observable countSteps = 0;

  @computed get whiteIsNext() {
    return (this.countSteps % 2) === 0;
  }

  @action.bound putStone(idx) {
    if (!this.squares[idx]) {
      this.squares[idx] = this.whiteIsNext ? 'white' : 'black';
      this.countSteps += 1;
    }
  }
}

export default GameState;
