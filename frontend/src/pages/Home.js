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

  }

  render() {
    const timeBarStyles = {
      width: this.props.game.percentageLeftinGame,
    };
    return (
      <div>
        <div className='field projectExplanation'>
          <h2>How does it work, and what is it all about?</h2>
          <p className="introduction"><strong>Play `Go`</strong> (WeiQi, Baduk) <br />on the public facade of the Museum of Modern Arts (Kunsthaus) in Graz/Austria!<br />
While having fun, you contribute to the genuine project Play4Privacy (P4P), combining elements of game, arts and technology.</p>

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
          
          
          <h3>How to play</h3>
          <div className="c50l howToIntro">
            <p>Use your PC or smart phone to join one of the two teams. <br />
            Supported by a consensus algorithm each team sets their stones in their quest for surrounding more territory than the opponent. <br />
            For every move you make, you earn one token.</p>
          </div>
          <div className="c50r howToPlayWithUs">
            <p><strong>Join the game, play Go with us!<br />From September 27th until October 27th. <br />Daily from 7pm to 10pm CEST.</strong></p> 
          </div>
          <div className="clear"></div>
          
        </div>

        <div className='creditsButton field'>
          <p><a className='button' href='credits' title='Get Credits'>Click here to start playing</a></p>
          <p className="centered">Or watch the current game here on the livecam.</p>

        </div>
        

        <div className='currentGame field'>
          <h2>Current game in progress</h2>

          <div className='liveCam'>
            <figure>
              <img
                src='http://bixcam.kunsthausgraz.at/out/stream/webcam2_x.jpg'
                alt='bix Livecam'
              />
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
        </div>

      </div>
    );
  }
}

export default Home;
