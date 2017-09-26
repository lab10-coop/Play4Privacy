import React from 'react';
import { inject } from 'mobx-react';
import $ from 'jquery';
import 'jquery.scrollto';
import gs from '../GameSettings';
import ethUtils from '../EthereumUtils';

@inject('game')
class EndGame extends React.Component {
  componentDidMount() {
    // TODO: Check with David if this is ok
    this.game = this.props.game;
    this.socket = this.game.socket;

    const explorerWalletUrl = `${gs.bcExplorerBaseUrl}/token/${gs.bcTokenContractAddr}?a=${this.game.id}`;
    const explorerLink = document.getElementById("explorerLink");
    explorerLink.href = explorerWalletUrl;
    explorerLink.innerHTML = explorerWalletUrl;

    // Navigation Mobile
    $('.navTrigger .showButton').click(function(){
      $(this).slideUp(250).parent().find('.hideButton').slideDown(250);
      $('header nav').slideDown(500);
    });

    $('.navTrigger .hideButton').click(function(){
      $(this).slideUp(250).parent().find('.showButton').slideDown(250);
      $('header nav').slideUp(500);
    });

    $('header nav a').click(function(){
      $('.navTrigger .hideButton').slideUp(250);
      $('.navTrigger .showButton').slideDown(250);
      $('header nav').slideUp(500);
    });

    // Button ScrollTo Layer / Top
    $('.button').click(function(){
      $.scrollTo(0, 250);
    });


    // Show Layers
    $('#redeemYourCoinButton').click(function(){
      $('.layer#redeemCoinDecision').addClass('showLayer');
    });


    $('#redeemCoinYesButton').click(() => {
      $('.layer#redeemCoin').addClass('showLayer');
      if(ethUtils.needsPersist()) {
        $('.layer#newWallet').addClass('showLayer');
      } else {
        $('.layer#linkedWallet').addClass('showLayer');
      }
    });


    $('#ethNoButton').click(() => {
      this.socket.emit('donate tokens', this.game.id);
      $('.layer#thankYou').addClass('showLayer');
    });

    /*
  	$('#redeemCoinSend').click(function(){
  		$('.layer#redeemCoinSuccessful').addClass('showLayer');
  	});
    */
    $('#createWallet').click(() => {
      const pass = document.getElementsByName("walletPassword")[0].value;
      try {
        ethUtils.persistWallet(pass);
        const docDlLink = document.getElementById("walletDownloadLink");
        ethUtils.updateDownloadLink(docDlLink);
        $('.layer#walletCreated').addClass('showLayer');
      } catch(e) { // this can happen if this view is opened in a new session with a wallet persisted
        alert("Sorry, the wallet could not be created. Did you refresh the page?\n" +
          "You can always play again.");
      }
    });

    // we interpret this as intent to keep the tokens.
    // Note that we are not sure if the wallet was really saved. The user may also have cancelled. In that case: Sorry :-/
    $('#walletDownloadLink').click(() => {
      this.socket.emit('redeem tokens', this.game.id);
      $('.layer#redeemCoinSuccessful').addClass('showLayer');
    })

    $('#sendWalletFile').click(() => {
      const inputElem = document.getElementsByName("email")[0];
      if(! inputElem.validity.valid) {
        alert("Entered E-Mail address is not valid");
      } else {
        const email = inputElem.value;
        this.socket.emit('redeem tokens', this.game.id);
        this.socket.emit('email wallet', this.game.id, email, JSON.stringify(ethUtils.getEncryptedKeystore()));
        $('.layer#redeemCoinSuccessful').addClass('showLayer');
      }
    });

    $('#sendTokensToLinkedWallet').click(() => {
      this.socket.emit('redeem tokens', this.game.id);
      $('.layer#redeemCoinSuccessful').addClass('showLayer');
    });









    // Hide Layer
    $('.closeLayerButton').click(function(){
      $(this).parent().removeClass('showLayer');
    });



  }


  render() {
    return (
      <div>
        <div className='field' id='gameSummary'>
          <div className='fieldInner'>

            <div className="c50l">
              <h2>Game Summary</h2>

              <div className='item'>
                <span className='label'>Winning team</span>
                <span className='value' id='whoWon'>Black</span>
              </div>
              <div className='item'>
                <span className='label'>time played</span>
                <span className='value' id='playTime'>13:37</span>
              </div>
              <div className='item'>
                <span className='label'>Total moves</span>
                <span className='value' id='totalMoves'>88</span>
              </div>
              <div className='item'>
                <span className='label'>Executed moves</span>
                <span className='value' id='executedMoves'>76</span>
              </div>
              <div className='item'>
                <span className='label'>Best player</span>
                <span className='value' id='bestPlayer'>SIU</span>
              </div>
            </div>
            <div className="c50r">
              <h2>Your Statistics</h2>

              <div className='item'>
                <span className='label'>Lorem</span>
                <span className='value' id='lorem'>1x</span>
              </div>

              <div className='item'>
                <span className='label'>Ipsum</span>
                <span className='value' id='ipsum'>13x</span>
              </div>

              <div className='item'>
                <span className='label'>Dolor</span>
                <span className='value' id='dolor'>2</span>
              </div>

              <div className='item'>
                <span className='label'>Sit amet</span>
                <span className='value' id='dolor'>17</span>
              </div>

              <div className='item'>
                <span className='label'>Conseceur</span>
                <span className='value' id='dolor'>No</span>
              </div>


            </div>
            <div className="clear separator"></div>


            <div className="c50l">
              <h2>Share your score and let your friends benefit from the #blockchain in real life!</h2>
              <p>
                <a className='socialIcon socialIconTwitter' href='https://twitter.com/home?status=https%3A//play.lab10.coop/' target="_blank">Share on Twitter</a>
                <a className='socialIcon socialIconFacebook' href='https://www.facebook.com/sharer/sharer.php?u=https%3A//play.lab10.coop/'>Share on Facebook</a>
                <a className='socialIcon socialIconTwitter' href='#'>Share on Steem.it</a>
                <a className='socialIcon socialIconTwitter' href='#'>Share on Pinterest</a>
                <a className='socialIcon socialIconTwitter' href='#'>Share on WoopWoop</a>
              </p>
            </div>
            <div className="c50r">
              <h2>Redeem your PLAY Token</h2>
              <p>
                <span className='button' id='redeemYourCoinButton'>Click here to start the redeem-process</span>
              </p>
            </div>
            <div className="clear"></div>





          </div>
        </div>

        <div className='layer' id='redeemCoinDecision'>
          <div className='layerInner'>

            <h2>Congratulations!</h2>
            <p>You earned <span className="playTokensAmount">?</span> PLAY tokens by proof-of-play.</p>
            <p>Now you can decide if you want to redeem the token or if you want to donate it to the development team to help further development of the project.</p>

            <h2>Redeem Coin</h2>
            <p>
              <span className='button' id='redeemCoinYesButton'>YES, give me the coin </span>
              <span className='button' id='ethNoButton'>
                NO thanks, I&apos;ll donate it to you for further development
              </span>
            </p>
          </div>
          <div className="closeLayerButton"></div>
        </div>

        <div className='layer' id='redeemCoin'>
          <div className='layerInner'>

            <h2>Here&apos;s how to get your Coin</h2>

            <div id='linkedWallet'>
              {/* <p><strong>### DEV-INFO: IF WALLET IS ALREADY LINKED ###</strong></p> */} 

              <p>Your PLAY tokens will be automatically sent to the wallet that is linked to your account:<br />
                <span className="yourWalletAdress">Wallet ADDRESS</span></p>

              <p><span className='button' id='sendTokensToLinkedWallet'>Click here to sent PLAY Tokens to your linked wallet</span></p>
            </div>

            <div id='newWallet'>
               {/* <p><strong>### DEV-INFO: ELSE - WALLET FOUND BUT NOT LINKED YET ###</strong></p> */} 

              <p>Please enter a strong password below (number, capital letter) to encrypt your wallet. Make sure to remember your password as this will be the only way to open your wallet for now.</p>

              <div className="formWrapper">
                <input name='walletPassword' type='password' className='text' placeholder='Password' />
                <input type='submit' value='Create Wallet' className='submit' id='createWallet' />
              </div>
            </div>

          </div>
          <div className="closeLayerButton"></div>
        </div>



        <div className='layer' id='walletCreated'>
          <div className='layerInner'>

            <h2>Your wallet was successfully created. </h2>
            <p>Just enter your email address and we will send you your wallet file via email.</p>

            <form className="formWrapper">
              <input name='email' type='email' className='text' placeholder='Your email adress' />
              <input type='button' value='Send' className='submit' id='sendWalletFile' />
            </form>

            <p>If you do not want to share your email address - simply <a href="#" id="walletDownloadLink" title="Download Wallet File">click here to download</a> the file to your computer.</p>

          </div>
          <div className="closeLayerButton"></div>
        </div>





        <div className='layer' id='redeemCoinSuccessful'>
          <div className='layerInner'>

            <h2>The tokens are underway.</h2>
            <p>This process can take few minutes to several hours - depening on the state of the blockchain.</p>
            <p>
              You can check the state of your wallet using the following link:<br/>
              <a id="explorerLink" href="#" target="_blank" title="Check transaction at etherscan.io">#</a>
            </p>
            <p>
              <a className='button' href='gameboard'>back to the board</a>
            </p>

          </div>
        </div>





        <div className='layer' id='thankYou'>
          <div className='layerInner'>
            <h2>Thank you!</h2>
            <p> Thanks for donating you coin to us for further development.</p>
            <p><a className='button' href='gameboard'>back to the board</a></p>
          </div>
        </div>


      </div>
    );
  }
}

export default EndGame;
