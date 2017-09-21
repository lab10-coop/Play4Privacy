import React from 'react';
import { observer, inject } from 'mobx-react';
import $ from 'jquery';
import Board from '../Board';

@inject('game')
@observer
class Home extends React.Component {
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
      $('header nav').fadeOut(200);
    });

    // Refresh LiveCam Feed
    var liveCamPhoto = document.getElementById("liveFeedImage");
    function updateImage() {
      liveCamPhoto.src = liveCamPhoto.src.split("?")[0] + "?" + new Date().getTime();
    }
    
    setInterval(updateImage, 1000);


  }

  render() {
    const timeBarStyles = {
      width: this.props.game.percentageLeftinGame,
    };
    return (
      <div>
        <div className='field projectExplanation'>
          <h2>Play for fun and benefit from the blockchain in real life!</h2>
          <p className="introduction"><strong>Play `Go`</strong> (WeiQi, Baduk) <br />on a public facade and earn crypto tokens for every move you make!</p>
          
          
          <div className="c50l">

          <ul>
            <li>Generate one token every 20 seconds.</li>
            <li>Play for free and anonymously.</li>
            <li>Play for a cause: For every token won, a donation is made towards for internet privacy initiatives.</li>
          </ul>
          <p>Experience the blockchain and the “wisdom of the crowd” in the most playful manner. Contribute your opinion for the next move.</p>
          <p>The gameboard can be viewed in public at the Museum of modern Arts (“Kunsthaus”) in Graz (Austria) or on the live stream below.</p> 

          
          
          
          </div>
          <div className="c50r comePlayWithUs">
            <p><strong>Join the game, play with us!</strong><br />From September 27th until October 27th. <br />Daily from 7pm to 10pm CEST.</p> 
          </div>
          <div className="clear"></div>
          
        </div>

        <div className='field hide' id='asSeenOn'>
          <div className='fieldInner'>  
          
            
            
          </div>
        </div>


        <div className='creditsButton field _gamePaused'>
          <p><a className='button' href='gameboard' title='Play Go and get PLAY Tokens!'>Click here to start playing</a></p>
          <p className="centered">and earn tokens for your decision.</p>

        </div>
        

        <div className='currentGame field _gamePaused'>
          
          <h2>Current game in progress</h2>

          <div className='liveCam'>
            <figure>
              <img id="liveFeedImage" src='http://bixcam.kunsthausgraz.at/out/stream/webcam2_x.jpg' alt='bix Livecam' />
              <figcaption>Current Live-Feed from BixCam </figcaption>
            </figure>
          </div>

          <div className='gameField'>
            <Board />
          </div>

          <div className='playTime clear'>
            Playtime:&nbsp;
            <span className='timeLeft'>
              {this.props.game.timeLeftInGame.getMinutes()}m&nbsp;
              {this.props.game.timeLeftInGame.getSeconds()}s
            </span>
            &nbsp;left of
            <span className='totalTime'> {this.props.game.maxGameDuration.getMinutes()}m</span>
            <span className='timeBar' style={timeBarStyles} />
          </div>
          
          <div className="gamePausedLayer">
            <div className="gamePausedLayerInner">
              <div className="icon"></div>
              <div className="gamePausedText">
                <span className="headline"><strong>Game Paused!</strong><br />check back from 7pm to 10pm CEST</span>
              </div>
            </div>
          </div>
        </div>

        <div className='field projectExplanation'>
          <h2>How does it work?</h2>
          <p>This Go-platform is running on a blockchain. Get to know how this technology works in the most playful manner. Just join a team and start playing.</p>
          <p>Supported by a consensus algorithm, each team sets their stones in their quest for surrounding more territory than the opponent. Every player is rewarded with a PLAY-token for their suggestion for the next move.</p>
          <p>Collect one token for every move, every 20 seconds. You can store your tokens 100% anonymously in your browser or export them to (and generate)  an external Ethereum wallet.</p>
          <p>For every token mined, a supplement coin is generated and donated to non-profit organisations fighting for privacy.</p>
          <div className="hotspots">
            <div className="c33l blockchain">
              <div className="hotspot">
                <h3>Experience the <br />blockchain</h3>
                <div className="icon"></div>
                <p>Our platform is running <br />on a blockchain.</p>
                <p>Get to know how this technology works in the most playful manner.</p>
              </div>
            </div>
            <div className="c33c reward">
              <div className="hotspot">
                <h3>Get <br />rewarded</h3>
                <div className="icon"></div>
                <p>P4P introduces a novel concept to “mine” crypto-currencies on a <br />proof-of-PLAY basis.</p>
                <p>Every player gets rewarded with these virtual tokens (coins).</p>
              </div>
            </div>
            <div className="c33r privacy">                      
              <div className="hotspot">
                <h3>Play for<br /> a cause</h3>
                <div className="icon"></div>
                <p>For every token mined, <br />a supplement coin is generated <br />to auction.</p>
                <p>100% of the funds raised will be donated to non-profit organizations fighting for privacy.</p>
              </div>
            </div>
            <div className="clear"></div>
          </div>
          
          <p>Now it’s your turn to also benefit from the blockchain and cryptocurrencies!</p>
          
        </div>


        <div className='creditsButton field _gamePaused'>
          <p><a className='button' href='gameboard' title='Play Go and get PLAY Tokens!'>PLAY NOW!</a></p>
          <p className="centered">and earn tokens for your decision.</p>
        </div>
        
        <div className='field' id='buyPlayyTokensDesc'>
          <div className='fieldInner'>  
          
            <h2>Can I also buy PLAY-tokens?</h2>
            <p>Yes. For every token mined, a supplement coin is generated to sell. You can bid for these tokens. Secure a significant share of these tokens without investing time to play. The total of your investment will be donated to reputable non-profit organisations fighting for privacy.</p>
            <p>Registration for the auction of PLAY tokens happens only from 25th and 26th of September and from October 29th to 31st 2017.</p>
            <p>You can buy or sell tokens as soon as Play tokens are traded on Exchanges. Dte is yet to be announced</p>
            <p><a className='button' href='http://p4p.lab10.coop' title='Play Go and get PLAY Tokens!'>to bid for tokens, SIGN UP NOW! </a></p>
   
            
          </div>
        </div>       
        


      </div>
    );
  }
}

export default Home;
