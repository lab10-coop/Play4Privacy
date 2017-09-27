import mongoose from 'mongoose';

// Use native promises
mongoose.Promise = global.Promise;

const userSchema = mongoose.Schema({
  userId: String,
  creationDate: Date,
  score: Number,
});

export const User = mongoose.model('User', userSchema);

const playerSchema = mongoose.Schema({
  userId: String,
  team: Number,
});

export const Player = mongoose.model('Player', playerSchema);

const moveSchema = mongoose.Schema({
  userId: String,
  coordinate: Number,
  timestamp: Date,
});

export const Move = mongoose.model('Move', moveSchema);

const gameSchema = mongoose.Schema({
  gameStart: Date,
  board: [],
  submittedMoves: [ {
    round: Number,
    move: Number,
    sig: String,
  } ],
  tokenReceivers: [ String ],
  players: [ {
    userId: String,
  } ],
});

export const Game = mongoose.model('Game', gameSchema);

export default class PlayerData {
  constructor(team, validMoves) {
    this.team = team;
    this.validMoves = validMoves;
  }
}
