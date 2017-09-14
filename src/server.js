import path from 'path';
import express from 'express';
import http from 'http';
import socketio from 'socket.io';
import Game from './Game';
import { defineClientApi } from './api';

const app = express();
const server = http.Server(app);
const io = socketio(server);

app.set('port', process.env.PORT || 3001);

// Express only serves static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('frontend/build'));
}

// REST endpoint serving Board in JSON for Processing
app.get('/board', (request, response) => {
  const res = {
    "time" : Date.now(),
    "startTime" : game.startTime,
    "currentTeam": game.go.currentTeam(),
    "board": game.go.board,
    "gameState": game.gameState
  };
  response.send(JSON.stringify(res));
});

// handle every other route with index.html to support
// direct access to any client-side routes.
app.get('*', (request, response) => {
  response.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

const game = new Game(io);

io.on('connection', (socket) => {
  console.log('a user connected');
  defineClientApi(game, socket);
});

server.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
