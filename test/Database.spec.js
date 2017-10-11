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
    wrapper.getTokensByUser('abc').then(tok => {
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
    wrapper.getTokensByUser('abc').then(tok => {
      expect(tok.unclaimed === 5);
      done();
    });
  });

  it('should redeem unclaimed tokens', (done) => {
    const wrapper = new DatabaseWrapper();
    wrapper.getTokensByUser('abc').then(tok => {
      tok.redeemed += tok.unclaimed;
      tok.unclaimed = 0;
      tok.save((err) => {
        expect(!err);
        done();
      });
    });
  });

  it('after which unclaimed should again be zero', (done) => {
    const wrapper = new DatabaseWrapper();
    wrapper.getTokensByUser('abc').then(tok => {
      expect(tok.unclaimed === 0);
      done();
    });
  });

  it('get correct unclaimed tokensMap', (done) => {
    const wrapper = new DatabaseWrapper();
    wrapper.getUnclaimedTokensMap().then(tokMap => {
      expect(tokMap.length == 1);
      expect(tokMap.get('abc') === 5);
      done();
    });
  });

  it('save tokensMap', (done) => {
    const wrapper = new DatabaseWrapper();
    wrapper.getUnclaimedTokensMap().then(tokMap => {
      wrapper.persistUnclaimedTokensMap(tokMap).then( () => {
        done();
      })
    });
  });

  it('load, change and save tokensMap, then load again and check', (done) => {
    const wrapper = new DatabaseWrapper();
    wrapper.getUnclaimedTokensMap().then(tokMap => {
      console.log('got old tokMap');
      tokMap.set('abc', 7);
      tokMap.set('cba', 13);
      console.log('calling persist');
      wrapper.persistUnclaimedTokensMap(tokMap).then( () => {
        // check if correct
        wrapper.getUnclaimedTokensMap().then(tokMap => {
          expect(tokMap.length == 2);
          expect(tokMap.get('abc') === 7);
          expect(tokMap.get('cba') === 13);
          done();
        });
      })
    });
  });

  after((done) => {
    mongoose.connection.db.dropDatabase(() => {
      mongoose.connection.close(done);
    });
  });
});
