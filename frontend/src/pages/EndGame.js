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

    // TODO: this is lost on page load. Would need session store
    //document.getElementsByClassName("playTokensAmount")[0].innerHTML = this.game.earnedTokens;
    // TODO: if this is 0, redirect to board?

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
    
    /*
    $('#redeemYourCoinButton').click(function(){
      $('.layer#redeemCoinDecision').addClass('showLayer');
    });
    */


    $('#redeemCoinYesButton').click(() => {
      $('.layer#redeemCoin').addClass('showLayer');
      if(ethUtils.needsPersist()) {
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
        $('#walletCreated').addClass('showLayer');
      } catch(e) { // this can happen if this view is opened in a new session with a wallet persisted
        alert("Sorry, the wallet could not be created. Did you refresh the page?\n" +
          "You can always play again.");
      }
    });

    // we interpret this as intent to keep the tokens.
    // Note that we are not sure if the wallet was really saved. The user may also have cancelled. In that case: Sorry :-/
    $('#walletDownloadLink').click(() => {
      this.socket.emit('redeem tokens', this.game.id);
      $('#redeemCoinSuccessful').addClass('showLayer');
    })

    $('#sendWalletFile').click(() => {
      const inputElem = document.getElementsByName("email")[0];
      if(! inputElem.validity.valid) {
        alert("Entered E-Mail address is not valid");
      } else {
        const email = inputElem.value;
        this.socket.emit('redeem tokens', this.game.id);
        this.socket.emit('email wallet', this.game.id, email, JSON.stringify(ethUtils.getEncryptedKeystore()));
        $('#redeemCoinSuccessful').addClass('showLayer');
      }
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

        <div className='field' id='gameSummary'>
          <div className='fieldInner'>

            <div className="c50l">
              <h2>Share your score and let your friends benefit from the #blockchain in real life!</h2>
            </div>
            <div className="c50r">

              <p className="socialIcons">
                <a className='socialIcon socialIconTwitter' href='https://twitter.com/home?status=https%3A//play.lab10.coop/' target="_blank">Share on Twitter</a>
                <a className='socialIcon socialIconFacebook' href='https://www.facebook.com/sharer/sharer.php?u=https%3A//play.lab10.coop/' target="_blank">Share on Facebook</a>
                <a className='socialIcon socialIconGplus' href='https://plus.google.com/share?url=https%3A//play.lab10.coop/' target="_blank">Share on Google+</a>
                <a className='socialIcon socialIconSteem' href='https://steemit.com' target="_blank">Share on Steem.it</a>
                <a className='socialIcon socialIconReddit' href='https://reddit.com' target="_blank">Share on Reddit</a>
              </p>
            
            </div>
            <div className="clear"></div>

          </div>
        </div>


        <div className='layer' id='redeemCoin'>
          <div className='layerInner'>

            <h2>Redeem</h2>
            
            <div id='newWallet'>
               {/* <p><strong>### DEV-INFO: ELSE - WALLET FOUND BUT NOT LINKED YET ###</strong></p> */} 

              <p>Please enter a strong password (including numbers, lower case and upper case letters) to encrypt your wallet.</p>
              <p>Make sure to remember your password as this will be the ONLY way to open your wallet and access your PLAY tokens.</p>
              
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

            <h2>Success!</h2>
            <p>Congratulations, you have just created a wallet for yourself that hold your PLAY tokens.</p>
            <p>Just enter your email address and we will send you your wallet file via email.</p>

            <form className="formWrapper">
              <input name='email' type='email' className='text' placeholder='Your email adress' />
              <input type='button' value='Send' className='submit' id='sendWalletFile' />
            </form>

            <p>If you do not want to share your email address - simply <a href="#" id="walletDownloadLink" title="Download Wallet File">click here to download</a> the file to your computer.</p>

            
            <p>To access your wallet, visit <a href="https://www.myetherwallet.com/#send-transaction">https://www.myetherwallet.com/#send-transaction</a>, 
            upload your Keystore file and enter your password.</p>
            <p>You can check your account address and PLAY balance there.<br />
            You could even send your tokens to another address (if you have Ether to pay for your transaction fees).</p>
            <p>Welcome to the world of crypto!</p>
            <p>Invite your friends to also explore the concepts of crypto-currencies and PLAY with us. </p>
            
            
          </div>
          <div className="closeLayerButton"></div>
        </div>





        <div className='layer' id='redeemCoinSuccessful'>
          <div className='layerInner'>

            <h2>The token transaction is underway.</h2>
            <p>This process can take a few minutes up to several hours - depending on the state of the blockchain.</p>
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
            <p>Thanks for donating your tokens to us for further development.</p>
            <p><a className='button' href='gameboard'>back to the board</a></p>
          </div>
        </div>


      </div>
    );
  }
}

export default EndGame;
