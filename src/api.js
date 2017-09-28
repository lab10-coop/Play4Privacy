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
      fn(timestamp, Date.now() - game.startTime(), game.go.currentTeam(), game.hasJoined(id),
        game.playerMove(id), game.go.board, game.gameState);
    });
  });

  // Emit this event to join the currently running game,
  // returns the team you are assigned to, or an empty string
  // if joining failed.
  socket.on('join game', (id, fn) => checkedCall(() => fn(game.joinGame(id))));
  socket.on('submit move', (id, round, move, sig, fn) =>
    checkedCall(() => fn(game.submitMove(id, round, move, sig))),
  );

  socket.on('redeem tokens', (id) => {
    game.claimTokens(id, false);
  });

  socket.on('donate tokens', (id) => {
    game.claimTokens(id, true);
  });

  socket.on('email wallet', (id, email, keystore) => {
    game.sendWalletByEmail(id, email, keystore);
  });
}

export default class ServerApi {
  constructor(io) {
    this.io = io;
  }

  // Listen to this event to get notified when a new game starts.
  gameStarted(currentTeam, startDate) {
    this.io.emit('game started', currentTeam, startDate);
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
