import React from 'react';
import { inject } from 'mobx-react';
import $ from 'jquery';
import zxcvbn from 'zxcvbn';
import 'jquery.scrollto';
import gs from '../GameSettings';
import ethUtils from '../EthereumUtils';

@inject('game')
class EndGame extends React.Component {
  constructor(props) {
    super(props);
    this.state = { score: 0 };
    this.onPasswordUpdated = this.onPasswordUpdated.bind(this);
  }

  componentDidMount() {
    this.game = this.props.game;
    this.socket = this.game.socket;

    const explorerWalletUrl = `${gs.bcExplorerBaseUrl}/token/${gs.bcTokenContractAddr}?a=${this.game.id}`;
    const explorerLink = document.getElementById('explorerLink');
    explorerLink.href = explorerWalletUrl;
    explorerLink.innerHTML = explorerWalletUrl;

    // Remove React not working warning
    $('.reactNotWorking').remove();

    // Navigation Mobile
    $('.navTrigger .showButton').click((e) => {
      $(e.currentTarget).slideUp(250).parent().find('.hideButton')
        .slideDown(250);
      $('header nav').slideDown(500);
    });

    $('.navTrigger .hideButton').click((e) => {
      $(e.currentTarget).slideUp(250).parent().find('.showButton')
        .slideDown(250);
      $('header nav').slideUp(500);
    });

    $('header nav a').click(() => {
      $('.navTrigger .hideButton').slideUp(250);
      $('.navTrigger .showButton').slideDown(250);
      $('header nav').slideUp(500);
    });

    // Button ScrollTo Layer / Top
    $('.button').click(() => {
      $.scrollTo(0, 250);
    });

    $('#redeemCoinYesButton').click(() => {
      $('.layer#redeemCoin').addClass('showLayer');
      if (ethUtils.needsPersist()) {
        $('#newWallet').addClass('visible');
      } else {
        this.socket.emit('redeem tokens', this.game.id);
        $('#redeemCoinSuccessful').addClass('showLayer');
      }
    });

    $('#ethNoButton').click(() => {
      this.socket.emit('donate tokens', this.game.id);
      $('#thankYou').addClass('showLayer');
    });

    $('#createWallet').click(() => {
      const pass = document.getElementsByName('walletPassword')[0].value;
      try {
        ethUtils.persistWallet(pass);
        const docDlLink = document.getElementById('walletDownloadLink');
        ethUtils.updateDownloadLink(docDlLink);
        $('#walletCreated').addClass('showLayer');
      } catch (e) { // this can happen if this view is opened in a new session with a wallet persisted
        alert('Sorry, the wallet could not be created. Did you refresh the page?\n' +
          'You can always play again.');
      }
    });

    /* we interpret this as intent to keep the tokens. Note that we are not sure if the wallet was really saved.
    The user may also have cancelled. In that case: Sorry :-/ */
    $('#walletDownloadLink').click(() => {
      this.socket.emit('redeem tokens', this.game.id);
      $('#redeemCoinSuccessful').addClass('showLayer');
    });

    $('#sendWalletFile').click(() => {
      const inputElem = document.getElementsByName('email')[0];
      if (!inputElem.validity.valid) {
        alert('Entered E-Mail address is not valid');
      } else {
        const email = inputElem.value;
        this.socket.emit('redeem tokens', this.game.id);
        this.socket.emit('email wallet', this.game.id, email, JSON.stringify(ethUtils.getEncryptedKeystore()));
        $('#redeemCoinSuccessful').addClass('showLayer');
      }
    });

    // Hide Layer
    $('.closeLayerButton').click((e) => {
      $(e.currentTarget).parent().removeClass('showLayer');
    });
  }

  /* estimates password strength based on the results from zxcvbn and
  calculates some scenarios regarding cost and time needed to crack it.
  Numbers are based on information in https://www.emsec.rub.de/media/mobsec/veroeffentlichungen/2015/04/02/duermuth-2014-password-guessing.pdf
  and Litecoin mining. */
  onPasswordUpdated(event) {
    const result = zxcvbn(event.target.value);
    // console.log(`zxcvbn result is ${JSON.stringify(result)}`);

    // since the result contains a list of matched terms, we can easily confront the user with that
    const dictMatches = result.sequence.filter(e => e.pattern === 'dictionary').map(e => e.matched_word).join(', ');

    // single GPU, cost calculated over 2 years, electricity 0.2$ per kWH
    const lowGuessesPerDollar = 2E6;
    // Hashrate per dollar block reward earned in Litecoin network divided by 100 (params)
    const highGuessesPerDollar = 1.3E10;

    // single GPU from PDF
    const lowGuessesPerSecond = 50;
    // NSA budget for "processing" in 2013 according to german Wikipedia (~ 50$ / s)
    const highGuessesPerSecond = 6.5E11;

    // where the fuck is setState() implemented?
    this.setState({
      score: result.score,
      guesses: result.guesses,
      costOptimistic: result.guesses / lowGuessesPerDollar,
      costPessimistic: result.guesses / highGuessesPerDollar,
      timeOptimistic: result.guesses / lowGuessesPerSecond,
      timePessimistic: result.guesses / highGuessesPerSecond,
      dictMatches: dictMatches, // eslint-disable-line
    });
  }

  /* rule of thumb: for estimates, numbers shouldn't be precise */
  humanReadableMoney(v) { // eslint-disable-line
    if (v < 0.01) {
      return '< 0.01 USD';
    }
    if (v < 1) {
      return `~ ${Math.round(v * 100) / 100} USD`; // 2 digits
    }
    if (v < 1000) {
      return `~ ${Math.round(v)} USD`;
    }
    if (v < 1E6) {
      return `~ ${Math.round(v / 1000) * 1000} USD`; // last 3 digits to 0
    }
    if (v < 1E9) {
      return `~ ${Math.round(v / 1E6)} million USD`;
    }
    if (v < 1E12) {
      return `~ ${Math.round(v / 1E9)} billion USD (for comparison: Austria's GDP in 2016 was about 386 billion)`;
    }
    if (v < 1E15) {
      return `~ ${Math.round(v / 1E12)} trillion USD (for comparison: the world GDP in 2016 was about 75 trillion according to the world bank)`; // eslint-disable-line
    }
    if (v < 1E18) {
      return `~ ${Math.round(v / 1E15)} quadrillion USD (for comparison: the intergalactic GDP... Just kidding. Nobody gives a fuck about GDP out there!)`; // eslint-disable-line
    }
    return 'Tilt!';
  }

  humanReadableTime(v) { // eslint-disable-line
    const minutes = 60;
    const hours = minutes * 60;
    const days = hours * 24;
    const weeks = days * 7;
    const years = days * 365; // fuck leapyears

    if (v < 1E-3) {
      return '< 1 ms';
    }
    if (v < 1) {
      return `~ ${Math.round(v * 1000) / 1000} ms`;
    }
    if (v < minutes) {
      return `~ ${Math.round(v)} seconds`;
    }
    if (v < hours) {
      return `~ ${Math.round(v / minutes)} minutes`; // last 3 digits to 0
    }
    if (v < days) {
      return `~ ${Math.round(v / hours)} hours`;
    }
    if (v < weeks) {
      return `~ ${Math.round(v / days)} days`;
    }
    if (v < years) {
      return `~ ${Math.round(v / weeks)} weeks`;
    }
    return `~ ${Math.round(v / years)} years`;
  }

  /* eslint-disable */

  render() {
    const barValueId = `barValue-${this.state.score}`;

    return (
      <div>
        <div className='field' id='gameSummary'>
          <div className='fieldInner'>

            <h2>Congratulations!</h2>
            <p>You earned<span className="playTokensAmount"></span> PLAY tokens as proof-of-play.</p>
            <p>Do you want to <strong>redeem these tokens</strong> and create an Ethereum wallet to store them?</p>    
            <p>Or, do you want to donate your PLAY tokens to the further development of the project?</p>

            <p>
              <span className='button' id='redeemCoinYesButton'>REDEEM</span>
              <span className='button' id='ethNoButton'>DONATE</span>
            </p>


          </div>
        </div>



        <div className='layer' id='redeemCoin'>
          <div className='layerInner'>

            <h2>Lock Wallet</h2>
            
            <div id='newWallet'>
               {/* <p><strong>### DEV-INFO: ELSE - WALLET FOUND BUT NOT LINKED YET ###</strong></p> */} 
              <p>When you started playing, a <a href="https://www.ethnews.com/what-is-a-cryptocurrency-wallet" target="_blank">Wallet</a> was automatically created by this application.<br />
              In order to not lose it (and hereby also the PLAY tokens just earned) when closing this browser tab, it needs to be saved.<br />
              Before doing that, the wallet is now locked in order to protect the PLAY tokens and other crypto assets you may in future manage with this wallet.</p>
              <p>Please enter a <b><a href="https://www.schneier.com/essays/archives/2014/02/choosing_a_secure_pa.html" target="_blank">strong password</a></b> to encrypt the private key of your wallet.</p>
              
              
             <div className={`setPasswordWrapper ${this.humanReadableMoney(this.state.costOptimistic) != "Tilt!" ? 'calculated' : ''}`}>
                <div className="setPasswordWrapperInner">
                  
                  <p>Make sure to remember your password as this will be the ONLY way <br />to unlock your wallet 
                  and access your PLAY tokens in the future.<br />
                  <strong>There is NO "forgot password" option in crypto land!</strong></p>
                
                  <div className="formWrapper">
                    <input name='walletPassword' type='password' className='text' placeholder='Password' value={this.state.value} onChange={this.onPasswordUpdated} />
                    <input type='submit' value='Lock Wallet' className='submit' id='createWallet' />
                  
                    <div className="passwordStrength">
                      <div className="barWrapper">
                        <div className="barValue" id={barValueId}></div>
                      </div>
                      <div className="pwStrengthLabel">Password strength</div>
                    </div>
                  </div>
                
                
                
                  <div className="pwStrengthCalc">
                    <div className="c33l optimistic">
                      <div className="inner">
                        <h3>Optimistic scenario</h3>
                        <p>
                          <span className="label">Estimated cost to crack: </span>
                          <span className="value">{this.humanReadableMoney(this.state.costOptimistic)}</span>
                        </p>
                        <p>
                          <span className="label">Estimated time to crack: </span>
                          <span className="value">{this.humanReadableTime(this.state.timeOptimistic)}</span>
                        </p>
                        <p className="shortDesc">
                          <span className="label">Info:</span>
                          An individual with a single modern GPU.<br />
                          Numbers are based on <a href="https://www.emsec.rub.de/media/mobsec/veroeffentlichungen/2015/04/02/duermuth-2014-password-guessing.pdf" target="_blank">this paper</a>.
                        </p>
                        
                      </div>
                    </div>
                    <div className="c33c pessimistic">
                      <div className="inner">
                        <h3>Pessimistic scenario</h3>
                        <p>
                          <span className="label">Estimated cost to crack: </span>
                          <span className="value">{this.humanReadableMoney(this.state.costPessimistic)}</span>
                        </p>
                        <p>
                          <span className="label">Estimated time to crack: </span>
                          <span className="value">{this.humanReadableTime(this.state.timePessimistic)}</span>
                        </p>
                        <p className="shortDesc">
                          <span className="label">Info:</span>
                          Extremely powerful attackers with very deep pockets leveraging the maximum achievable effectiveness.
                        </p>

                      </div>
                    </div>
                    <div className="c33r dictionary">                      
                      <div className="inner">
                        <h3>Dictionary</h3>
                        <p>
                          <span className="label">Words found in this password: </span>
                          <span className="value">{this.state.dictMatches}</span>
                        </p>
                        <p className="shortDesc">
                          <span className="label">Info:</span>
                          Note that this test - since running in the browser - includes only a limited English dictionary. Sophisticated password crackers nowadays have extensive and sophisticated dictionaries which also include a lot of non-trivial permutations.
                        </p>
                       
                      </div>
                    </div>
                    <div className="clear"></div>
                  </div>
                
                
                  
              
                
                </div>
              </div>
              
              
   
                    
              <div className={`infoPessimistic ${this.humanReadableMoney(this.state.costOptimistic) != "Tilt!" ? 'calculated' : ''}`}>
                <p>For the cost calculation on the  "pessimistic scenario", the numbers of Litecoin mining are used: hashrate per dollar of block reward, divided by 100 (because the Litecoin scrypt params allow for a significantly higher hashrate).</p>
                <p>For the time calculation, a budget of 50 USD per second is assumed. That's based on public budget information for "processing" of a random intelligence agency. For comparison: Litecoin currently generates ~ 10 USD / second in block rewards, for Bitcoin it's about 100 USD / second.</p>
                <hr />
              </div>  
              

              <div className={`overallNotice ${this.humanReadableMoney(this.state.costOptimistic) != "Tilt!" ? 'calculated' : ''}`}>
                <h3>Notice</h3>
                <p>The numbers can't be more than rough estimates and are based on a mix of known facts and speculation.<br />
                The basic guess is calculated by the <a href="https://github.com/dropbox/zxcvbn" target="_blank">zxcvbn library</a> which also includes a basic English dictionary and knows some common tricks like dates, spatial patterns (e.g. qwerty) and <a href="https://en.wikipedia.org/wiki/Leet" target="_blank">l33t speak</a>.</p>
                <p>It's important to understand that the difficulty to crack a password depends not only on the password itself, but (a lot!) on the algorithm used to hash the password.</p>
                <p>In case of this wallet, the algorithm is <a href="https://en.wikipedia.org/wiki/Scrypt" target="_blank">scrypt</a> with params n=8192, r=8, p=1.
                      That means hashing one password (and thus also making one guess) takes about 100ms on a common CPU. This is already quite good (a so called "slow hash"). But "offline cracking" (that is, the attacker has a local copy of the hash) nevertheless makes it much easier to crack a password compared to a situation where the attacker doesn't have a local copy and needs to guess through a remote service.</p>
                <p>That's also the reason why the likelihood of passwords stolen from a server are likely to be cracked even if not stored as plaintext.</p>              
              </div>


            </div>

          </div>
          <div className="closeLayerButton"></div>
        </div>



        <div className='layer' id='walletCreated'>
          <div className='layerInner'>

            <h2>Export your wallet</h2>
            <p>Congratulations, you have just created a wallet that holds your PLAY tokens.</p>

            <p><b><a href="#" id="walletDownloadLink" title="Download Wallet File">Click here to save</a></b> your password protected wallet/keystore file.</p>

            <hr />

            <p>As an alternative, we can send you the wallet via Email:</p>
            <form className="formWrapper">
              <input name='email' type='email' className='text' placeholder='Your email adress' />
              <input type='button' value='Send' className='submit' id='sendWalletFile' />
            </form>
            <br/>
            <p className="emailWarning">
              <strong>Please be patient if you do not receive the email right away, it may take a few hours.</strong>
            </p>
            <p>Be aware that in this case the password protected wallet file is uploaded to our server and transmitted via 3rd party <a href="https://en.wikipedia.org/wiki/Simple_Mail_Transfer_Protocol" target="_blank" title="SMTP Wikipedia">SMTP</a> servers.<br />
              This implies that anybody along that route can probably de-anonymize your wallet's address / public key via the association with the Email address, and potentially also crack the included private key (in case the chosen password is not strong enough to make that infeasible).<br />
            </p>
            <p>This is not to scare you, but to help understanding various choices and their implications.<br />
              In case you don't plan to use this wallet to deposit large sums of crypto money or want to keep your Go skills a secret, using the Email feature is probably a no-brainer.</p>


          </div>
          <div className="closeLayerButton"></div>
        </div>





        <div className='layer' id='redeemCoinSuccessful'>
          <div className='layerInner'>
            <h2>Tokens scheduled for transfer</h2>
            
            <p>
              You can check the state of your wallet using the following link:<br/>
              <a id="explorerLink" href="#" target="_blank" title="Check transaction at etherscan.io">#</a><br />
              <span className="noticeMessage">(Note: New tokens will be distributed once a day)</span>
              Be aware that using a 3rd party service like Etherscan can potentially de-anonymize you (by associating the wallet address included in the URL with your IP address).
            </p>

            <h3>Access your tokens/wallet</h3>
            <p>To access your wallet, you can use any wallet application which can import such JSON keystore files.<br />
            A quick option is <a href="https://www.myetherwallet.com/#send-transaction" target="_blank">https://www.myetherwallet.com/#send-transaction</a>.<br />
              Here, select "Keystore File", open the downloaded Keystore file and enter your password.<br />
            Note that although MyEtherWallet is a web application, it does NOT upload your wallet/keystore file anywhere. All processing is done locally in your browser.
            </p>
            <p>
            If you just want to check your account balance, there's no need to unlock the wallet.<br />
            For that you can also just visit a so called "Blockchain Explorer".<br />
            The above link to etherscan.io is just that and shows the status of the account included in this wallet.</p>
            <p>
            In order to send some of your tokens to somebody else, you first need to load the wallet with a small amount of Ether for transaction fees.
            </p>
            <p>
            In general, be careful where you enter the password. A lot of phishing is happening.
            </p>


            <p>Welcome to the world of crypto!</p>

          
            <p>
              <a className='button' href='gameboard'>back to the board</a>
            </p>
            

            <hr />
            <div className="socialIconsWrapper">
              <p><strong>Share and let your friends benefit from the blockchain in real life!</strong></p>
              <p className="socialIcons">
                <a className='socialIcon socialIconTwitter' href='https://twitter.com/home?status=I%20just%20received%20a%20few%20tokens%20for%20playing%20a%20game.%20Benefit%20from%20the%20%23blockchain%20in%20real%20life!%20%23p4p%20www.play4privacy.org' target="_blank">Share on Twitter</a>
                <a className='socialIcon socialIconFacebook' href='https://www.facebook.com/sharer/sharer.php?u=https%3A//play.lab10.coop/' target="_blank">Share on Facebook</a>
                <a className='socialIcon socialIconGplus' href='https://plus.google.com/share?url=https%3A//play.lab10.coop/' target="_blank">Share on Google+</a>
                <a className='socialIcon socialIconReddit' href='http://www.reddit.com/submit?url=https%3A//play.lab10.coop/&title=Play4Privacy' target="_blank">Share on Reddit</a>
              </p>          
            </div>
            

          </div>
        </div>





        <div className='layer' id='thankYou'>
          <div className='layerInner'>
            <h2>Thank you!</h2>
            <p>Thanks for donating your tokens to us for further development.</p>
            <p><a className='button' href='gameboard'>back to the board</a></p>
          
            <hr />
            <div className="socialIconsWrapper">
              <p><strong>Share and let your friends benefit from the blockchain in real life!</strong></p>
              <p className="socialIcons">
                <a className='socialIcon socialIconTwitter' href='https://twitter.com/home?status=I%20just%20received%20a%20few%20tokens%20for%20playing%20a%20game.%20Benefit%20from%20the%20%23blockchain%20in%20real%20life!%20%23p4p%20www.play4privacy.org' target="_blank">Share on Twitter</a>
                <a className='socialIcon socialIconFacebook' href='https://www.facebook.com/sharer/sharer.php?u=https%3A//play.lab10.coop/' target="_blank">Share on Facebook</a>
                <a className='socialIcon socialIconGplus' href='https://plus.google.com/share?url=https%3A//play.lab10.coop/' target="_blank">Share on Google+</a>
                <a className='socialIcon socialIconReddit' href='http://www.reddit.com/submit?url=https%3A//play.lab10.coop/&title=Play4Privacy' target="_blank">Share on Reddit</a>
              </p>          
            </div>
          
          </div>
        </div>


      </div>
    );
  }
}

export default EndGame;
