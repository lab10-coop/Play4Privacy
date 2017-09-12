import React from 'react';
import $ from 'jquery';
import 'jquery.scrollto';

class Credits extends React.Component {
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
    $('#ethYesButton').click(function(){
      $('.layer#ethYesField').addClass('showLayer');
    });
     
    $('#ethNoButton').click(function(){
      $('.layer#ethNoField').addClass('showLayer');
    });
    
    
    // Hide Layer
    $('.closeLayerButton').click(function(){
      $(this).parent().removeClass('showLayer');
    });
   
 

  }

  render() {
    return (
      <div>
      
        <div className='field' id='howToPlay'>
          <div className='fieldInner'>
            <h2>How to play</h2>
            <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod
              tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At
              vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
              no sea takimata sanctus est Lorem ipsum dolor sit amet.</p>
            <h2>Do you own the cryptocurrency Ethereum (ETH) ?</h2>
            <p>
              <span className='button' id='ethYesButton'>YES</span>
              <span className='button' id='ethNoButton'>NO</span>
            </p>
            <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod
              tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero
              eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea
              takimata sanctus est Lorem ipsum dolor sit amet.</p>
          </div>
        </div>
        
        <div className='layer' id='ethYesField'>
          <div className='layerInner'>
            <h2>Get your credits</h2>
            <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod
              tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At
              vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
              no sea takimata sanctus est Lorem ipsum dolor sit amet.</p>
            <div className='walletQR'>HIER KOMMT DER WALLET-QR-CODE REIN</div>
            <p>
              <span className='ethWalletAdress'>xyzxyzxyzxyzxyzxyzxyzxyzxy</span>
              <span className='button' id='ethWalletNext'>NEXT</span>
            </p>
          </div>
          <div className="closeLayerButton"></div>
        </div>
        
        <div className='layer' id='ethNoField'>
          <div className='layerInner'>
            <h2>Get your credits</h2>
            <p>Instruction on how to get credits... Lorem ipsum dolor sit amet, consetetur
              sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna
              aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea
              rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor
              sit amet.</p>
            <div className='freeGames clear'>
              <span className='freeGamesLeft'>133</span>
              <span> free games remaining in this batch</span>
              <span className='freeGamesBar' />
            </div>

            <div className='claimFreeGame'>
              <h2>claim a free game</h2>
              <p>Just answer the question below and claim your credit</p>
              <p>
                <span className='freeGameQuestion'>
                  What is the name of the exhibition this game is about?
                </span>
              </p>
              <form>
                <input type='text' className='text' placeholder='Enter your answer here...' />
                <input type='submit' className='submit' value='send' />
              </form>
            </div>
          </div>
		  <div className="closeLayerButton"></div>
        </div>

      </div>
    );
  }
}

export default Credits;
