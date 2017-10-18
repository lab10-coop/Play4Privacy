import { before, after } from 'mocha';
import { expect } from 'chai';
import mongoose from 'mongoose';
import DatabaseWrapper, { connectToDb } from '../src/Database';
import { User } from '../src/Models';

describe('Database', () => {
  before((done) => {
    connectToDb('mongodb://mongo:27017/testing', done);
  });

  describe('"Connect"', () => {
    it('should save a User successfully', (done) => {
      const wrapper = new DatabaseWrapper();
      wrapper.saveUser('abc', (err) => {
        if (err) { throw err; }

        User.find({ userId: 'abc' }, (err, user) => {
          if (err) { throw err; }
          expect(user.length).to.equal(1);
          expect(user[0].userId).to.equal('abc');
          done();
        });
      });
    });
  });

  it('should return a new token entry and then update it', (done) => {
    const wrapper = new DatabaseWrapper();
    wrapper.getTokensByUser('abc').then((tok) => {
      expect(tok.unclaimed === 0);

      tok.unclaimed += 5;

      tok.save((err) => {
        expect(!err);
        done();
      });
    });
  });

  it('should return an existing token entry with correct unclaimed value', (done) => {
    const wrapper = new DatabaseWrapper();
    wrapper.getTokensByUser('abc').then((tok) => {
      expect(tok.unclaimed === 5);
      done();
    });
  });

  it('load all, redeem one, save all, check', (done) => {
    const wrapper = new DatabaseWrapper();
    wrapper.getAllTokens().then((allTok) => {
      const t1 = allTok.find(tok => tok.userId === 'abc');
      t1.redeemed = t1.unclaimed;
      t1.unclaimed = 0;
      return wrapper.persistTokens(allTok);
    }).then(() => {
      wrapper.getAllTokens().then((allTok) => {
        const t1 = allTok.find(tok => tok.userId === 'abc');
        expect(t1.unclaimed === 0);
        expect(t1.redeemed === 7);
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
