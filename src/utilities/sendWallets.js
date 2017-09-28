import { EmailWallet } from '../Models';
import DatabaseWrapper, { connectToDb } from '../Database';
import sendWallet from './Mailer';

const dbName = process.env.MONGO_DB_NAME;
connectToDb(`mongodb://mongo:27017/${dbName}`, console.log);
var wrapper = new DatabaseWrapper();
console.log(`connected to ${dbName}`)

function processTask(mt) {
  console.log(`task: address ${mt.userId}, email: ${mt.email}, wallet len: ${mt.wallet.length}`)

  // sendWallet(recipient, subject, text, buffer, fn
  sendWallet("test@d10r.net", "Your PLAY tokens",
`Hello,

you just earned PLAY tokens for "proof-of-play". You find your password protected wallet (Keystore) file attached.

To access your wallet, you can use any wallet application which can import such JSON keystore files.
A quick option is https://www.myetherwallet.com/#send-transaction
Select "Keystore File", open your Keystore file and enter your password.

If you just want to check your account balance, there's no need to unlock the wallet.
For that you can also just visit a so called "Blockchain Explorer", for example
https://etherscan.io/token/0xfB41f7b63c8e84f4BA1eCD4D393fd9daa5d14D61?a=${mt.userId}
shows the status of the account included in this wallet.

In order to send some of your tokens to somebody else, you first need to load the wallet with a small amount of Ether for transaction fees.

In general, be careful where you enter the password. A lot of phishing is happening.

Welcome to the world of crypto!

Regards
Your team from www.play4privacy.org
`,
    mt.wallet, ( ret => {
      console.log(`mailer returned ${ret}`);
    })
  )
}

EmailWallet.find().exec( function(err, mailTasks) {
  if (err) {
    throw new Error(err)
  }
  console.log(`has ${mailTasks.length} entries`)

  // idea for this throttled loop: https://stackoverflow.com/a/24293516/261952
  for(var i=0; i<mailTasks.length; i++) {
    const addr = mailTasks[i].userId;
    if(addr.length < 40) {
      console.error(`bad address ${addr}, skipping (we may apologize instead)`)
    }
    (function(mt, ind) {
      setTimeout(() => {
        console.log(`${mailTasks.length - ind} tasks left...`)
        processTask(mailTasks[i]);
      }, 5000*ind);
    })(mailTasks[i], i);
  }
})