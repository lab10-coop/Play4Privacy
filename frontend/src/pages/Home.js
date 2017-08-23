import React from 'react';
import { observer, inject } from 'mobx-react';
import Board from '../Board';

const Home = inject('game')(observer(props =>
  (
    <div>
      <div className='projectExplanation field'>
        <h2>How it works, and wtf is this all about?</h2>
        <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod
          tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero
          eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea
          takimata sanctus est Lorem ipsum dolor sit amet.</p>
      </div>

      <div className='creditsButton field'>
        <a className='button' href='credits.html' title='Get Credits'>Get Credits</a>
      </div>

      <div className='currentGame field'>
        <h2>Current Game</h2>

        <div className='liveCam'>
          <img src='http://bixcam.kunsthausgraz.at/out/stream/webcam2_x.jpg' alt='bix Livecam' />
        </div>

        <div className='gameField'>
          <Board />
        </div>

        <div className='playTime clear'>
          Playtime: <span className='timeLeft'>{props.game.timeLeftInGame.getMinutes()}m&nbsp;
            {props.game.timeLeftInGame.getSeconds()}s</span> left of
          <span className='totalTime'> {props.game.maxGameDuration.getMinutes()}m</span>
          <span className='timeBar' />
        </div>
      </div>
      <div className='partners field'>
        <h2>Partners</h2>
        <a href='#'>Partner #1</a>
        <a href='#'>Partner #2</a>
        <a href='#'>Partner #3</a>
        <a href='#'>Partner #4</a>
      </div>
    </div>
  ),
));

export default Home;
