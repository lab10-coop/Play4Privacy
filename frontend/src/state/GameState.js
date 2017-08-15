import { observable, computed, action } from 'mobx';

class GameState {
  boardSize = 9;

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
