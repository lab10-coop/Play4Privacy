/* eslint class-methods-use-this: [0] */
/* mongoose connections and models are stored implicitly, but we still want to 
   conveniently access all functions to manipulate the database using one class instance */

import mongoose from 'mongoose';
import { User, Token } from './Models';

export function connectToDb(mongodbAddress, connected, disconnected, reconnected) {
  mongoose.connect(mongodbAddress, {
    useMongoClient: true,
  }).then(() => {
    connected();
    mongoose.connection.on('disconnected', () => {
      console.log('DATABASE DISCONNECTED');
      if (disconnected) {
        disconnected();
      }
    });
    mongoose.connection.on('reconnected', () => {
      console.log('DATABASE RECONNECTED');
      if (reconnected) {
        reconnected();
      }
    });
  }, (err) => {
    // @todo handle case where the database is unavalabile right at startup
    console.log(`MongoDB connection failed!!\n${err}`);
  });
}

class DatabaseWrapper {
  saveUser(id, fn) {
    User.find({ userId: id }, (err, users) => {
      if (err) {
        fn(err);
      }
      if (users.length === 0) {
        // Add User
        const newUser = new User({
          userId: id,
          creationDate: new Date(),
          score: 0,
        });
        newUser.save((err) => {
          if (err) {
            fn(err);
          }
          fn();
        });
      } else {
        fn();
      }
    });
  }

  // returns a promise for the entry matching the user or a new empty record if not exists
  getTokensByUser(id) {
    //console.log(`getTokensByUser ${id}`)
    return new Promise( (resolve, reject) => {
      Token.findOne({userId: id}, (err, tok) => {
        if (err) {
          console.error(`Token.findOne failed!`);
          reject(err);
        } else {
          if (!tok) {
            //console.log(`creating new token entry for ${id}`);
            const newTok = new Token({
              userId: id,
              unclaimed: 0,
              redeemed: 0,
              donated: 0
            });
            newTok.save();
            resolve(newTok);
          } else {
            resolve(tok);
          }
        }
      });
    });
  }

  getUnclaimedTokensMap() {
    return new Promise((resolve, reject) => {
      Token.find().exec(function (err, entries) {
        if (err) {
          console.error(`Token.find().exec() failed!`);
        } else {
          if (!entries) {
            console.log('null response');
          }
          const tokMap = new Map();
          entries.map( e => tokMap.set(e.userId, e.unclaimed));
          resolve(tokMap);
        }
      });
    });
  }

  persistUnclaimedTokensMap(tokMap) {
    //console.log(`persisting ${tokMap.size} entries`);
    return new Promise( (resolve, reject) => {
      let getPromises = [];
      let savePromises = [];
      for (let t of tokMap) {
        const id = t[0];
        const amount = t[1];
        //console.log(`persisting ${id}, amount ${amount}`);
        getPromises.push(this.getTokensByUser(id).then(tok => {
          tok.unclaimed = amount;
          savePromises.push(tok.save(err => {
            if (err) {
              console.error(`saving failed for ${id} with error ${err}`);
            } else {
              //console.log(`saved ${id}`);
            }
          }));
        }));
      }
      Promise.all(getPromises).then( () => {
        Promise.all(savePromises).then( () => {
          //console.log(`saved all`);
          resolve();
        });
      });
    });
  }
}

export class DatabaseWrapperDummy {
  constructor() {
    this.users = new Map();
  }

  saveUser(id, fn) {
    if (!this.users.has(id)) {
      const newUser = new User({
        userId: id,
        creationDate: new Date(),
        score: 0,
      });
      this.users.set(id, newUser);
    }
    fn();
  }

  getTokensByUser(id) {
    //console.log(`getTokensByUser ${id}`)
    return new Promise( (resolve, reject) => {
      const newTok = new Token({
        userId: id,
        unclaimed: 0,
        redeemed: 0,
        donated: 0
      });
      resolve(newTok);
    });
  }

  getUnclaimedTokensMap() {
    return new Promise((resolve, reject) => {
      resolve(new Map());
    });
  }

  persistUnclaimedTokensMap(tokMap) {
    //console.log(`persisting ${tokMap.size} entries`);
    return new Promise((resolve, reject) => {
      resolve();
    });
  }
}

export default DatabaseWrapper;
