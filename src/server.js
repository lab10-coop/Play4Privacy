import path from 'path';
import express from 'express';
import http from 'http';
import socketio from 'socket.io';
import Game from './Game';
import { defineClientApi } from './api';

const app = express();
const server = http.Server(app);
const io = socketio(server);

let mongodbName = '';
if (process.env.MONGO_DB_NAME) {
  mongodbName = process.env.MONGO_DB_NAME;
}

console.log(`Configured MongoDB Database Name: ${mongodbName}`);

const game = new Game(io, mongodbName);

app.set('port', process.env.PORT || 3001);
app.set('hostname', process.env.HOSTNAME || '::');

// Express only serves static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('frontend/build'));
}

// REST endpoint serving Board in JSON for Processing
app.get('/board', (request, response) => {
  const res = {
    time: Date.now(),
    startTime: game.startTime(),
    currentTeam: game.go.currentTeam(),
    board: game.go.board,
    gameState: game.gameState,
  };
  response.send(JSON.stringify(res));
});

// handle every other route with index.html to support
// direct access to any client-side routes.
app.get('*', (request, response) => {
  response.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

let clientSockets = new Set();

io.on('connection', (socket) => {
  const socketId = socket.id;
  const clientIp = socket.request.connection.remoteAddress;
  const clientPort = socket.request.connection.remotePort;

  socket.getIp = function() { return this.request.connection.remoteAddress };
  socket.nrConnectionsFromSameIp = function() {
    const clientsArr = Array.from(clientSockets.values());
    return clientsArr.filter(s => s.request.connection.remoteAddress === this.getIp()).length;
  };
  socket.on('disconnect', function() {
    clientSockets.delete(socket);
    console.log(`closed connection: socket id ${socketId}, client: ip ${clientIp} port ${clientPort}. open connections: ${clientSockets.size}`);
  });

  clientSockets.add(socket);

  defineClientApi(game, socket);
  console.log(`new connection: socket id ${socketId}, client: ip ${clientIp} port ${clientPort}. open connections: ${clientSockets.size}`);

  const clientsArr = Array.from(clientSockets.values());
  if(socket.nrConnectionsFromSameIp() > 1) {
    console.log(`!!! There are already ${socket.nrConnectionsFromSameIp()} connections from that ip`);
  }
});

server.listen(app.get('port'), app.get('hostname'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
