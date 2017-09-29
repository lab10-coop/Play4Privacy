import { before, after } from 'mocha';
import { expect } from 'chai';
import mongoose from 'mongoose';
import { Move, User, Player, PlayedGame } from '../src/Models';

describe('MongoClient', () => {
  before((done) => {
    const promise = mongoose.connect('mongodb://mongo:27017/testing', {
      useMongoClient: true,
    });
    promise.then(() => {
      console.log('We are connected to test database!');
      done();
    }, (err) => {
      console.error(`connection error: ${err}`);
    });
  });

  describe('"Move Model"', () => {
    it('should save an entry successfully', (done) => {
      const testMove = new Move({
        userId: 'davidf',
        coordinate: 2,
        timestamp: new Date(),
      });

      testMove.save(done);
    });
    it('should return the correct move', (done) => {
      Move.find({ userId: 'davidf' }, (err, moves) => {
        if (err) { throw err; }
        expect(moves.length).to.equal(1);
        done();
      });
    });
  });

  describe('"User Model"', () => {
    it('should save an entry successfully', (done) => {
      const testUser = new User({
        userId: 'davidf',
        creationDate: new Date(),
        score: 0,
      });

      testUser.save(done);
    });
    it('should return the correct user', (done) => {
      User.find({ userId: 'davidf' }, (err, user) => {
        if (err) { throw err; }
        expect(user.length).to.equal(1);
        expect(user[0].userId).to.equal('davidf');
        (new Player({
          userId: user[0].userId,
          team: 1,
        })).save(done);
      });
    });
    it('should contain one player', (done) => {
      Player.find({ userId: 'davidf' }, (err, user) => {
        if (err) { throw err; }
        expect(user.length).to.equal(1);
        done();
      });
    });
    it('should be empty after clearing', (done) => {
      Player.remove({}, (err) => {
        if (err) { throw err; }
        Player.find({ userId: 'davidf' }, (err, user) => {
          if (err) { throw err; }
          expect(user.length).to.equal(0);
          done();
        });
      });
    });
  });

  describe('"Game Model"', () => {
    it('should save an entry successfully', (done) => {
      const submittedMoves = [ {
        round: 3,
        move: 4,
        sig: 'somesig',
      },
      {
        round: 4,
        move: 7,
        sig: 'anothersig',
      } ];

      const testGame = new PlayedGame({
        gameId: new Date().getTime(),
        startDate: new Date(),
        board: [ 4, 5, 7 ],
        submittedMoves,
        tokenReceivers: [],
        players: [ {
          userId: 'davidf',
        } ],
      });

      testGame.save(done);
    });
    it('should contain correct user', (done) => {
      PlayedGame.find({}, (err, games) => {
        if (err) { throw err; }
        expect(games.length).to.equal(1);
        expect(games[0].players[0].userId).to.equal('davidf');
        done();
      });
    });
  });

  after((done) => {
    mongoose.connection.db.dropDatabase(() => {
      mongoose.connection.close(done);
    });
  });
});
