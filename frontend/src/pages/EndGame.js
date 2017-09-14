import React from 'react';
import $ from 'jquery';
import 'jquery.scrollto';

class EndGame extends React.Component {
  componentDidMount() {
	
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
     
  	
  	$('#redeemCoinYesButton').click(function(){
  		$('.layer#redeemCoin').addClass('showLayer');
  	});
     
  	
  	$('#ethNoButton').click(function(){
  		$('.layer#thankYou').addClass('showLayer');
  	});
     
    /*
  	$('#redeemCoinSend').click(function(){
  		$('.layer#redeemCoinSuccessful').addClass('showLayer');
  	});
    */
    
    $('#createWallet').click(function(){
  		$('.layer#walletCreated').addClass('showLayer');
  	});
    
    
    $('#sendWalletFile').click(function(){
  		$('.layer#redeemCoinSuccessful').addClass('showLayer');
  	});
    
   	$('#sendTokensToLinkedWallet').click(function(){
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
	              <span className='label'>Who won the game</span>
	              <span className='value' id='whoWon'>Black</span>
	            </div>
	            <div className='item'>
	              <span className='label'>Play time</span>
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
	            <div className='item'>
	              <span className='label'>Worst player</span>
	              <span className='value' id='worstPlayer'>OIL</span>
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
	            
	            <div className='item'>
	              <span className='label'>Et ast</span>
	              <span className='value' id='dolor'>17x</span>
	            </div>
            </div>
            <div className="clear separator"></div>
            
          
            <div className="c50l">
              <h2>Share on:</h2>
	            <p>
	              <a className='socialIcon socialIconTwitter' href='#'>Share on Twitter</a>
	              <a className='socialIcon socialIconFacebook' href='#'>Share on Facebook</a>
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
            <p>You earned <span className="playTokensAmount">13</span> PLAY tokens by proof-of-play.</p>
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

              <p><strong>### DEV-INFO: IF WALLET IS ALREADY LINKED ###</strong></p>
              
              <p>Your PLAY tokens will be automatically sent to the wallet that is linked to your account:<br />
              <span className="yourWalletAdress">Wallet ADDRESS</span></p>
              
              <p><span className='button' id='sendTokensToLinkedWallet'>Click here to sent PLAY Tokens to your linked wallet</span></p>
            
            
              <p><strong>### DEV-INFO: ELSE - NO WALLET IS ALREADY LINKED ###</strong></p>
            
              <p>Please enter a strong password below (number, capital letter) to encrypt your wallet. Make sure to remember your password as this will be the only way to open your wallet for now.</p>
            
            <form>
              <input name='walletPassword' type='password' className='text' placeholder='Password' />
              <input type='submit' value='Create Wallet' className='submit' id='createWallet' />
            </form>


          </div>
          <div className="closeLayerButton"></div>
        </div>
        
        
        
         <div className='layer' id='walletCreated'>
          <div className='layerInner'>

            <h2>Your wallet was successfully created. </h2>
            <p>Just enter your email address and we will send you your wallet file via email.</p>
            
            <form>
              <input name='email' type='text' className='text' placeholder='Your email adress' />
              <input type='submit' value='Send' className='submit' id='sendWalletFile' />
            </form>
            
            <p>If you do not want to share your email address - simply press <a href="#" title="Download Wallet File">here to download</a> 
            the file to your computer.</p>

          </div>
          <div className="closeLayerButton"></div>
        </div>
        
               
        


        <div className='layer' id='redeemCoinSuccessful'>
          <div className='layerInner'>

            <h2>The transfer was successfully initiated.</h2>
            <p>The process can take less than a minute to several hours - depening on the state of the blockchain.</p>
            <p>
            You can check the transaction using the following link:<br/>
            <a href="https://etherscan.io/XYZXYZXYZXYZXYZ" target="_blank" title="Check transaction at etherscan.io">https://etherscan.io/XYZXYZXYZXYZXYZ</a>
            </p>
            <p>
              <a className='button' href='gameboard'>back to the board</a>
            </p>

          </div>
          <div className="closeLayerButton"></div>
        </div>





        <div className='layer' id='thankYou'>
          <div className='layerInner'>
	          <h2>Thank you!</h2>
	          <p> Thanks for donating you coin to us for further development.</p>
	          <p><a className='button' href='gameboard'>back to the board</a></p>
          </div>
          <div className="closeLayerButton"></div>
        </div>


      </div>
    );
  }
}

export default EndGame;
