import path from 'path';
import express from 'express';
import http from 'http';
import socketio from 'socket.io';
import Game from './Game';

const app = express();
const server = http.Server(app);
const io = socketio(server);

app.set('port', process.env.PORT || 3001);

// Express only serves static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('frontend/build'));
}

// handle every other route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
app.get('*', (request, response) => {
  response.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

const game = new Game(io);

io.on('connection', (socket) => {
  console.log('a user connected');

  // //////////////////////////////////////////////////////////////////////////
  // Server API

  // Returns the current game state
  // Note: Sends the current server time to allow the front-end to 
  //       calculate an offset between the back- and front-end clocks.
  socket.on('current game state', (fn) => {
    fn(Date.now(), game.startTime);
  });

  // //////////////////////////////////////////////////////////////////////////
});

server.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
