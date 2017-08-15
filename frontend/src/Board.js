import React from 'react';
import { observer, inject } from 'mobx-react';
import './index.css';

function Square(props) {
  // Expects two props to be sent:
  // - onClick() - a function called when the Square is clicked
  // - value - the current value of this field, should be a single character in this particular case

  return (
    <div className={[ 'place', props.value ].join(' ')} onClick={() => props.onClick()} />
  );
}

@inject('gamestate')
@observer
class Board extends React.Component {
  renderSquare(i) {
    // Sets the props for the "Square" Component
    // Note: Captures the value of variable "i"
    return (
      <Square
        value={this.props.gamestate.squares[i]}
        onClick={() => this.props.gamestate.putStone(i)}
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
    for (let i = 0; i < this.props.gamestate.boardSize; i++) {
      outer.push(this.renderRow(this.props.gamestate.boardSize, i));
    }

    return (
      <div className='goField'>
        {outer}
      </div>
    );
  }
}

export default Board;
