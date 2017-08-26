import React from 'react';
import { observer, inject } from 'mobx-react';
import GameSettings from './GameSettings';
import './index.css';

function Square(props) {
  // Expects two props to be sent:
  // - onClick() - a function called when the Square is clicked
  // - value - the current value of this field, should be a single character in this particular case
  let stoneColor = '';
  if (props.value === 'WHITE') {
    stoneColor = 'white';
  } else if (props.value === 'BLACK') {
    stoneColor = 'black';
  }
  return (
    <div className={[ 'place', stoneColor ].join(' ')} onClick={() => props.onClick()} />
  );
}

@inject('game')
@observer
class Board extends React.Component {
  renderSquare(i) {
    // Sets the props for the "Square" Component
    // Note: Captures the value of variable "i"
    return (
      <Square
        value={this.props.game.squares[i]}
        onClick={() => this.props.game.submitMove(i)}
      />
    );
  }

  renderRow(boardSize, e) {
    const rowElements = [];
    for (let i = boardSize * e; i < boardSize * (e + 1); i++) {
      rowElements.push(this.renderSquare(i));
    }

    return rowElements;
  }

  render() {
    const outer = [];
    for (let i = 0; i < GameSettings.BOARD_SIZE; i++) {
      outer.push(this.renderRow(GameSettings.BOARD_SIZE, i));
    }

    return (
      <div className='goField'>
        {outer}
      </div>
    );
  }
}

export default Board;
