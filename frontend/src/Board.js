import React from 'react';
import { observer, inject } from 'mobx-react';
import gs from './GameSettings';
import './index.css';

function Square(props) {
  // Expects two props to be sent:
  // - onClick() - a function called when the Square is clicked
  // - value - the current value of this field, should be a single character in this particular case
  let stoneColor = '';
  if (props.value === gs.WHITE) {
    stoneColor = 'white';
  } else if (props.value === gs.BLACK) {
    stoneColor = 'black';
  } else if (props.value === gs.PLACED) {
    stoneColor = 'placed';
  }

  const classes = [ 'place', stoneColor ];
  if (props.previousMove === 'true') {
    classes.push('lastPlaced');
  }

  if (props.otherMoves) {
    classes.push('otherVotes');
  }

  return (
    <div className={classes.join(' ')} onClick={props.onClick}>{props.otherMoves ? props.otherMoves : ''}</div>
  );
}

@inject('game')
@observer
class Board extends React.Component {
  renderSquare(i) {
    // Sets the props for the "Square" Component
    // Note: Captures the value of variable "i"
    let otherMoves = this.props.game.placedMoves[i];

    return (
      <Square
        value={this.props.game.squares[i]}
        onClick={() => this.props.game.submitMove(i)}
        previousMove={(this.props.game.previousMove === i) ? 'true' : 'false'}
        otherMoves={otherMoves}
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
    for (let i = 0; i < gs.BOARD_SIZE; i++) {
      outer.push(this.renderRow(gs.BOARD_SIZE, i));
    }

    return (
      <div className='goField'>
        {outer}
      </div>
    );
  }
}

export default Board;
