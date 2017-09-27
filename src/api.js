function checkedCall(fn) {
  try {
    fn();
  } catch (err) {
    console.log(`API call error!! Error message: ${err.message}`);
  }
}

export function defineClientApi(game, socket) {
  // Emit this event to receive the current game state from cratch,
  // for example right after connecting/reconnecting to the server.
  socket.on('current game state', (id, timestamp, fn) => {
    checkedCall(() => {
      fn(timestamp, Date.now() - game.startTime, game.go.currentTeam(), game.hasJoined(id),
        game.playerMove(id), game.go.board, game.gameState);
    });
  });

  // Emit this event to join the currently running game,
  // returns the team you are assigned to, or an empty string
  // if joining failed.
  socket.on('join game', (id, fn) => checkedCall(() => fn(game.joinGame(id))));
  socket.on('submit move', (id, move, sig, fn) =>
    checkedCall(() => fn(game.submitMove(id, move, sig))),
  );

  socket.on('redeem tokens', (id) => { console.log("TODO: implement 'redeem tokens'"); });
  socket.on('donate tokens', (id) => { console.log("TODO: implement 'donate tokens'"); });
  socket.on('email wallet', (id, email, keystore) => { console.log("TODO: implement 'email wallet'"); })
}

export default class ServerApi {
  constructor(io) {
    this.io = io;
  }

  // Listen to this event to get notified when a new game starts.
  gameStarted(currentTeam) {
    this.io.emit('game started', currentTeam);
  }

  // Listen to this event to get notified when a round finished.
  roundFinished(nr, nextTeam, move, captured) {
    this.io.emit('round finished', nr, nextTeam, move, captured);
  }

  // Listen to this event to get notified when a game finished.
  gameFinished() {
    this.io.emit('game finished');
  }

  sendGameUpdates(numPlayers) {
    this.io.emit('game updates', numPlayers);
  }
}
