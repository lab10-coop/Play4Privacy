/* eslint class-methods-use-this: [0] */
/* mongoose connections and models are stored implicitly, but we still want to 
   conveniently access all functions to manipulate the database using one class instance */

import mongoose from 'mongoose';
import { User } from './Models';

class Database {
  constructor(mongodbAddress, connected, disconnected, reconnected) {
    mongoose.connect(mongodbAddress, {
      useMongoClient: true,
    }).then(() => {
      connected();
      mongoose.connection.on('disconnected', () => {
        console.log('DATABASE DISCONNECTED');
        disconnected();
      });
      mongoose.connection.on('reconnected', () => {
        console.log('DATABASE RECONNECTED');
        reconnected();
      });
    }, (err) => {
      // @todo handle case where the database is unavalabile right at startup
      console.log(`MongoDB connection failed!!\n${err}`);
    });
  }

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
}

export default Database;
