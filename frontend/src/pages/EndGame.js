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



        <div className='layer' id='redeemCoin'>
          <div className='layerInner'>

            <h2>Let's create a wallet together!</h2>
            
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

            <h2>Export your wallet</h2>
            <p>Congratulations, you have just created a wallet for yourself that hold your PLAY tokens.</p>
            <p>Just enter your email address and we will send you your wallet file via email.</p>

            <form className="formWrapper">
              <input name='email' type='email' className='text' placeholder='Your email adress' />
              <input type='button' value='Send' className='submit' id='sendWalletFile' />
            </form>
            
            <p className="emailWarning">
              Due to the high expected load on our servers during the first hours, please be patient if you do not recieve the email right away.<br/>
              <strong>Your wallet should arrive within the next hours.</strong>
            </p>
            
            <p>If you do not want to share your email address - simply <a href="#" id="walletDownloadLink" title="Download Wallet File">click here to download</a> the file to your computer.</p>
            
            
          </div>
          <div className="closeLayerButton"></div>
        </div>





        <div className='layer' id='redeemCoinSuccessful'>
          <div className='layerInner'>
            <h2>Please bear with us.</h2>
            
            <p className="emailWarning">You will receive the wallet file and your PLAY-tokens in the next few hours.</p>
            <p>
              You can check the state of the token-distribution using the following link:<br/>
              <a id="explorerLink" href="#" target="_blank" title="Check transaction at etherscan.io">#</a><br />
              <span className="noticeMessage">(Note: New tokens will be distributed once a day)</span>
            </p>

            <h3>Access your tokens/wallet</h3>
            <p>To access your wallet, visit <a href="https://www.myetherwallet.com/#send-transaction">https://www.myetherwallet.com/#send-transaction</a>, 
            upload your Keystore file and enter your password.</p>
            <p>You can check your account address and PLAY balance there.<br />
            You could even send your tokens to another address (if you have Ether to pay for your transaction fees).</p>
            <p>Welcome to the world of crypto!</p>
            <p>Invite your friends to also explore the concepts of crypto-currencies and PLAY with us. </p>

          
            <p>
              <a className='button' href='gameboard'>back to the board</a>
            </p>
            

            <hr />
            <div className="socialIconsWrapper">
              <p><strong>Share and let your friends benefit from the #blockchain in real life!</strong></p>
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
              <p><strong>Share and let your friends benefit from the #blockchain in real life!</strong></p>
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
