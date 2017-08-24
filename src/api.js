export function defineClientApi(game, socket) {
  // Emit this event to receive the current game state from cratch,
  // for example right after connecting/reconnecting to the server.
  socket.on('current game state', (id, fn) => {
    fn(Date.now(), game.startTime, game.currentTeam, game.hasJoined(id), game.playerMove(id));
  });

  // Emit this event to join the currently running game,
  // returns the team you are assigned to, or an empty string
  // if joining failed.
  socket.on('join game', (id, fn) => fn(game.joinGame(id)));

  socket.on('submit move', (id, move, fn) => fn(game.submitMove(id, move)));
}

export default class ServerApi {
  constructor(io) {
    this.io = io;
  }

  // Listen to this event to get notified when a new game starts.
  gameStarted(startTime, currentTeam) {
    this.io.emit('game started', startTime, currentTeam);
  }

  // Listen to this event to get notified when a round finished.
  roundFinished(nextTeam) {
    this.io.emit('round finished', nextTeam);
  }
}
