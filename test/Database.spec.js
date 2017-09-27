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

  after((done) => {
    mongoose.connection.db.dropDatabase(() => {
      mongoose.connection.close(done);
    });
  });
});
