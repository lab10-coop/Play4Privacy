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

const playedGameSchema = mongoose.Schema({
  startDate: Date,
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
  selectedMoves: [ Number ],
});

export const PlayedGame = mongoose.model('PlayedGame', playedGameSchema);

const emailWalletSchema = mongoose.Schema({
  userId: String,
  email: String,
  wallet: String,
  sent: {
    at: Date,
    success: Boolean
  }
});

export const EmailWallet = mongoose.model('EmailWallet', emailWalletSchema);

const tokenClaimSchema = mongoose.Schema({
  userId: String,
  donate: Boolean,
  date: Date
});

export const TokenClaim = mongoose.model('TokenClaim', tokenClaimSchema);

export default class PlayerData {
  constructor(team, validMoves) {
    this.team = team;
    this.validMoves = validMoves;
  }
}
