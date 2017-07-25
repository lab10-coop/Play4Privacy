import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css'

class Square extends React.Component {
  // Expects two props to be sent:
  // - onClick() - a function called when the Square is clicked
  // - value - the current value of this field, should be a single character in this particular case
  render() {
    return (
      <div className={["place", this.props.value].join(' ')} onClick={() => this.props.onClick()}>
      </div>
    );
  }
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
      squares: squares,
      whiteIsNext: !this.state.whiteIsNext,
      countSteps: this.state.countSteps + 1,
    });
    $(".dev").text("step: " + this.state.countSteps);
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

  renderRow(board_size, e) {
    let row_elements = [];
    for (let i = board_size*e; i < board_size*(e+1); i++)
      row_elements.push(this.renderSquare(i));

    return row_elements;
  }

  render() {

    let status = 'Next player: ' + (this.state.whiteIsNext ? 'white' : 'black');

    $(".next_player").text(status);

    let outer = []
    for (let i = 0; i < this.board_size; i++)
      outer.push(this.renderRow(this.board_size, i));

    return (  
      <div className="goField">        
        {outer}
      </div>
    );
  }
}

class Game extends React.Component {
  render() {
    return (
      <Board />
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('react_root')
);
