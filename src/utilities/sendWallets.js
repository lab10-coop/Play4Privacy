import { EmailWallet } from '../Models';
import DatabaseWrapper, { connectToDb } from '../Database';
import mongoose from 'mongoose';
import sendWallet from './Mailer';

/*
Script for sending wallets by mail based in information in the DB.
Environment variables used:
MONGO_DB_NAME for the name of the DB
MAILER_SIMULATE in order to avoid not actually send, but just iterate and log what would be sent.
MAILER_DELAY Seconds to wait between SMTP sending requests. Default: 5 seconds

The used mailer module further requires:
MAILER_HOST
MAILER_USER
MAILER_PASS

The text content of the mail is hardcoded here.
*/

function usageExit() {
  console.log(`usage: ${process.argv[1]} send | marksent <from> <to> | repl`);
  process.exit(1);
}

if(process.argv.length < 3) {
  usageExit()
}

function init() {
  const dbName = process.env.MONGO_DB_NAME;
  connectToDb(`mongodb://mongo:27017/${dbName}`, console.log);
  console.log(`connected to ${dbName}`)
}

// processes a single item / sends one mail
function processTask(task) {
  console.log(`task: address ${task.userId}, email: ${task.email}, wallet len: ${task.wallet.length}`)

  if(! process.env.MAILER_SIMULATE) {
    // sendWallet(recipient, subject, text, buffer, fn
    sendWallet(task.email, "Your PLAY tokens",
`Hello,

you just earned PLAY tokens for "proof-of-play". You find your password protected wallet (Keystore) file attached.

To access your wallet, you can use any wallet application which can import such JSON keystore files.
A quick option is https://www.myetherwallet.com/#send-transaction
Select "Keystore File", open your Keystore file and enter your password.

If you just want to check your account balance, there's no need to unlock the wallet.
For that you can also just visit a so called "Blockchain Explorer", for example
https://etherscan.io/token/0xfB41f7b63c8e84f4BA1eCD4D393fd9daa5d14D61?a=${task.userId}
shows the status of the account included in this wallet.

In order to send some of your tokens to somebody else, you first need to load the wallet with a small amount of Ether for transaction fees.

In general, be careful where you enter the password. A lot of phishing is happening.

Welcome to the world of crypto!

Regards
Your team from www.play4privacy.org
`,
      task.wallet, ( (err, info) => {
        if(err) {
          console.error(`sending failed: ${JSON.stringify(err)}`);
          task.sent.success = false;
        } else {
          task.sent.success = true;
        }
        console.log(`nodemailer info: ${JSON.stringify(info)}`);
        task.sent.at = new Date();
        task.save();
      })
    )
  }
}

// returns a promise for an array of tasks from DB
function getTasksFromDb(filter) {
  return new Promise( (resolve, reject) => {
    EmailWallet.find(filter).exec(function (err, tasks) {
      if (err) {
        throw new Error(err)
      }
      resolve(tasks);
    })
  })
}

// process tasks with throttling in order to keep the mail server happy
function processAll(tasks, delaySec) {
  // idea for this throttled loop: https://stackoverflow.com/a/24293516/261952
  for(var i = 0; i < tasks.length; i++) {
    const addr = tasks[i].userId;
    if (addr.length < 40) {
      console.error(`bad address ${addr}, skipping (we may apologize instead)`)
    } else {
      (function (mt, ind) {
        setTimeout(() => {
          console.log(`${tasks.length - ind} tasks left...`)
          processTask(mt);
        }, delaySec * 1000 * ind);
      })(tasks[i], i);
    }
  }
}

function markAsSent(task, success) {
  task.sent = {
    at: new Date(),
    success: success
  }
  task.save();
}

// ############# MAIN ################

if(process.argv[2] == "send") {
  init();
  const waitBetweenMailsSec = process.env.MAILER_DELAY || 5;

  getTasksFromDb({'sent.success': undefined}).then( tasks => {
    console.log(`has ${tasks.length} entries. Using a delay of ${waitBetweenMailsSec} seconds between sending requests`)
    processAll(tasks, waitBetweenMailsSec)
  });
}
else if(process.argv[2] == "marksent")
{
  const from = parseInt(process.argv[3]);
  const to = parseInt(process.argv[4]);
  console.log(`from: ${from}, to: ${to}`);

  if(isNaN(from) || isNaN(to)) {
    usageExit();
  }

  init();

  getTasksFromDb().then( tasks => tasks.slice(from, to).map( t => {
    markAsSent(t, true);
    console.log(`processed entry with id ${t.id}, email ${t.email}`);
  }));
}
else if(process.argv[2] == "repl")
{
  init();
  global.ew = EmailWallet; // for debug
  global.getTasks = getTasksFromDb;
}
else {
  usageExit()
}

console.log(`This process may just keep running forever.
Figuring out when it's save to close the DB connection is not trivial with all this async tasks.
Just exit with Ctrl-C when you think all is done ;-)
`)
