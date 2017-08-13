import React from 'react';

import $ from 'jquery';

function Square(props) {
  // Expects two props to be sent:
  // - onClick() - a function called when the Square is clicked
  // - value - the current value of this field, should be a single character in this particular case

  return (
    <div className={[ 'place', props.value ].join(' ')} onClick={() => props.onClick()} />
  );
}

class Board extends React.Component {
  // The Board holds the state of all Squares in an Array
  constructor() {
    super();
    this.board_size = 9;
    this.state = {
      squares: Array(this.board_size * this.board_size).fill(null),
      whiteIsNext: true,
      countSteps: 0,
    };
  }

  // Passed to Square to update the Board's state
  handleClick(i) {
    // Always make changes on a copy of the current state!
    const squares = this.state.squares.slice();
    if (squares[i]) {
      return;
    }
    squares[i] = this.state.whiteIsNext ? 'white' : 'black';
    this.setState({
      squares,
      whiteIsNext: !this.state.whiteIsNext,
      countSteps: this.state.countSteps + 1,
    });
    $('.dev').text(`${this.state.countSteps}s`);
  }

  renderSquare(i) {
    // Sets the props for the "Square" Component
    // Note: Captures the value of variable "i"
    return (
      <Square
        value={this.state.squares[i]}
        onClick={() => this.handleClick(i)}
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
    const status = this.state.whiteIsNext ? 'WHITE' : 'BLACK';

    $('.next_player').text(status);

    const outer = [];
    for (let i = 0; i < this.board_size; i++) {
      outer.push(this.renderRow(this.board_size, i));
    }

    return (
      <div className='goField'>
        {outer}
      </div>
    );
  }
}

export default Board;
