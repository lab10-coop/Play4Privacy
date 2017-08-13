import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import Board from './Board';
import './index.css';

function Game() {
  return (
    <Board />
  );
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('react_root'),
);
