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
        <div className='projectExplanation field'>
          <h2>How it works, and wtf is this all about?</h2>
          <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod
            tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero
            eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea
            takimata sanctus est Lorem ipsum dolor sit amet.</p>
        </div>

        <div className='creditsButton field'>
          <a className='button' href='credits' title='Get Credits'>Click here to start playing</a>
        </div>

        <div className='currentGame field'>
          <h2>Current Game</h2>

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
