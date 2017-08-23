import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'mobx-react';
import { useStrict } from 'mobx';
import io from 'socket.io-client';
import Game from './Game';
import App from './App';

import './css/styles-responsive.css';
import './css/styles.css';

useStrict();
const socket = io();
const game = new Game(socket);

// ========================================

ReactDOM.render(
  <Provider game={game}>
    <Router>
      <App />
    </Router>
  </Provider>,
  document.getElementById('react_root'),
);
