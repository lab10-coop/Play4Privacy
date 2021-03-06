import path from 'path';
import fs from 'fs';
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

const clientSockets = new Set();

io.on('connection', (socket) => {
  const socketId = socket.id;
  socket.getIp = function () { // eslint-disable-lin
    return socket.request.headers['x-forwarded-for'] || this.request.connection.remoteAddress;
  };
  const clientPort = socket.request.connection.remotePort;

  socket.nrConnectionsFromSameIp = function () {
    const clientsArr = Array.from(clientSockets.values());
    return clientsArr.filter(s => s.getIp() === this.getIp()).length;
  };
  socket.on('disconnect', () => {
    clientSockets.delete(socket);
    console.log(`closed connection: socket id ${socketId}, client: ip ${socket.getIp()} port ${clientPort}. \
    open connections: ${clientSockets.size}`);
  });

  clientSockets.add(socket);

  defineClientApi(game, socket);
  console.log(`new connection: socket id ${socketId}, client: ip ${socket.getIp()} port ${clientPort}. \
  open connections: ${clientSockets.size}`);

  // const clientsArr = Array.from(clientSockets.values());
  if (socket.nrConnectionsFromSameIp() > 1) {
    console.log(`!!! There are already ${socket.nrConnectionsFromSameIp()} connections from that ip`);
  }
});

game.readyForConnections.then(() => {
  server.listen(app.get('port'), app.get('hostname'), () => {
    console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
  });
});

/* If a fifo with name "control.pipe" exists, listen to it for cmds. Implements unidirectional IPC (KISS style) */
function watchPipe(_fd) {
  fs.createReadStream(null, { fd: _fd, encoding: 'utf8' })
    .on('data', (data) => {
      const cmd = data.trim();
      switch (cmd) {
        case 'test':
          console.log('test cmd. doing nothing more');
          break;
        case 'reloadTokens':
          console.log('PIPE cmd reloadTokens');
          game.loadTokens();
          break;
        default:
          console.log(`PIPE unknown cmd: ${cmd}`);
      }
      // TODO: is there a more elegant way to keep reading?
      /* adding "autoClose: false" to the options in createReadStream() avoids the stream to close,
      but doesn't continue reading on new data. */
      watchPipe(_fd);
      // }).on('end', () => {
      //  console.log('PIPE: end');
    })
    .on('close', () => {
      console.log('PIPE: close');
    });
}
let fd = null;
try {
  fd = fs.openSync('control.pipe', 'r+');
} catch (e) {
  console.error('PIPE control.pipe for IPC does not exist - disabled.');
}
if (fd) {
  watchPipe(fd);
}
