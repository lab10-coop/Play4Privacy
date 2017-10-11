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
  // params: userId, client's current timestamp
  // returns: clientTimeStamp, elapsedTime, currentTeam, team, move, boardState, gameState, unclaimed tokens
  socket.on('current game state', (id, timestamp, fn) => {
    console.log(`game state request by ${id}`);
    checkedCall(() => {
      fn(game.gameId(), timestamp, Date.now() - game.startTime(), game.go.currentTeam(), game.hasJoined(id),
        game.playerMove(id), game.go.board, game.gameState, game.getUnclaimedTokensOf(id));
    });
  });

  // Emit this event to join the currently running game,
  // returns the team you are assigned to, or an empty string
  // if joining failed.
  socket.on('join game', (id, fn) => {
    if(socket.nrConnectionsFromSameIp() > 1) {
      console.log(`${id} is from ip ${socket.getIp()} with ${socket.nrConnectionsFromSameIp()} connections open`)
    }
    if(id !== 'anonymous') {
      console.log(`join game by ${id} accepted`);
      checkedCall(() => fn(game.joinGame(id), game.getUnclaimedTokensOf(id)));
    } else {
      console.log(`join game by ${id} rejected`);
    }
  });

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
  gameStarted(gameId, currentTeam) {
    this.io.emit('game started', gameId, currentTeam);
  }

  gameStopped() {
    this.io.emit('game stopped');
  }

  // Listen to this event to get notified when a round finished.
  roundFinished(nr, nextTeam, move, captured) {
    console.log(`ROUND: nr ${nr}, move ${move}, team ${nextTeam}`);
    this.io.emit('round finished', nr, nextTeam, move, captured);
  }

  // Listen to this event to get notified when a game finished.
  gameFinished() {
    console.log(`game finished at ${new Date()}`)
    this.io.emit('game finished');
  }

  sendGameUpdates(numPlayers) {
    this.io.emit('game updates', numPlayers);
  }
}
