import React from 'react';
import $ from 'jquery';
import 'jquery.scrollto';

class EndGame extends React.Component {
  componentDidMount() {
	
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
   
  
	$('#redeemCoinSend').click(function(){
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
	              <span className='label'>ABC</span>
	              <span className='value' id='abc'>abc</span>
	            </div>
	
	            <div className='item'>
	              <span className='label'>DEF</span>
	              <span className='value' id='def' def />
	            </div>
	
	            <div className='item'>
	              <span className='label'>GHI</span>
	              <span className='value' id='ghi'>ghi</span>
	            </div>
	
				<h2>Share on:</h2>
	            <p>
	              <a className='socialIcon socialIconTwitter' href='#'>Share on Twitter</a>
	              <a className='socialIcon socialIconFacebook' href='#'>Share on Facebook</a>
	              <a className='socialIcon socialIconTwitter' href='#'>Share on Mastodon</a>
	              <a className='socialIcon socialIconTwitter' href='#'>Share on Pinterest</a>
	              <a className='socialIcon socialIconTwitter' href='#'>Share on WoopWoop</a>
	            </p>
	            <p>
	              <span className='button' id='redeemYourCoinButton'>Redeem your coin</span>
	            </p>
			</div>
			<div className="clear"></div>
          </div>
        </div>

        <div className='layer' id='redeemCoinDecision'>
          <div className='layerInner'>

            <h2>Redeem Coin</h2>
            <p>
              <span className='button' id='redeemCoinYesButton'>YES, give me the coin </span>
              <span className='button' id='ethNoButton'>
                NO thanks, I&apos;ll donate it to you for further development
              </span>
            </p>
            <p>What exactly is the coin and what can i do with it? .... Lorem ipsum dolor sit
              amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
              labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam
              et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
              sanctus est Lorem ipsum dolor sit amet.</p>
          </div>
          <div className="closeLayerButton"></div>
        </div>

        <div className='layer' id='redeemCoin'>
          <div className='layerInner'>

            <h2>Here&apos;s how to get your Coin</h2>
            <p>Instructions on how to the the Coin on the wallet.... Lorem ipsum dolor sit amet,
              consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
              dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo
              dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem
              ipsum dolor sit amet.</p>
            <p>
              <span className='button' id='redeemCoinSend'>send</span>
            </p>

          </div>
          <div className="closeLayerButton"></div>
        </div>


        <div className='layer' id='redeemCoinSuccessful'>
          <div className='layerInner'>

            <h2>Redeem successful</h2>
            <p>You successfully redeemd your coin... Lorem ipsum dolor sit amet, consetetur
              sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore
              magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores
              et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum
              dolor sit amet.</p>
            <p>
              <a className='button' href='gameboard'>back to the board</a>
            </p>

          </div>
          <div className="closeLayerButton"></div>
        </div>

        <div className='layer' id="redeemKunsthausCoin">
          <div className='layerInner'>
            <h2>Redeem your Kunsthaus Coin (Page #16)</h2>
            <p>Instructions to create Ethereum wallet</p>
            <p>Instructions on how to get the coin to the wallet + SEND button (links to #17)
              <span className='button' id='redeemCoinSend'>send</span>
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
