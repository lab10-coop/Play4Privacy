import React from 'react';
import { observer, inject } from 'mobx-react';
import $ from 'jquery';
import Board from '../Board';

@inject('game')
@observer
class GameBoard extends React.Component {
  componentDidMount() {
  }
  
  render() {
    const game = this.props.game;
 
    const timeBarStyleGame = {
      width: game.percentageLeftinGame,
    };
 
    const timeBarStyleRound = {
      width: game.percentageLeftinRound,
    };
   
    // game.myTeamActive is true if my team is the active team
    return (
      <div>
        <div className={'layer ' + (game.myTeam ? '':'showLayer')} id='startGame'>
          <div className='layerInner'>
            <h2>Start a Game</h2>
            <p>Welcome to... You can join the game whenever you want. </p>
            <p>
              If you want to have an instruction of the game or the mechanism click
              on the button below:<br />
              <span className='button' id='helpButton'>Need help?</span>
            </p>
            <h3>Optional:</h3>
            <p>You can add a 3 digit name for our leaderboard</p>
            <form>
              <input name='username' type='text' className='text' placeholder='Enter 3 Digits' />
              <input type='submit' value='Save' className='submit' />
            </form>
            <p>
              Ready? Good!<br />
              <span className='button' onClick={game.joinGame} id='joinGameButton'>
                JOIN GAME NOW
              </span>
            </p>
          </div>
        </div>
  
        <div className='field' id='gameField'>
          <div className='fieldInner'>
  
            <Board />
  
            <div className='gameInfo'>
              <h2>Player info:</h2>
              <div className='item'>
                <span className='label'>You are on team:</span>
                <span className='value' id='yourTeam'>{game.formattedMyTeam || '--'}</span>
              </div>
              <div className='item'>
                <span className='label'>Active Team</span>
                <span className='value' id='activeTeam'>
                  {game.gameState ? game.formattedCurrentTeam : '--'}
                </span>
              </div>
              <div className='item'>
                <span className='label'>Time to vote</span>
                <span className='value' id='timeToVote'>
                  {game.gameState ? `${game.timeLeftInRound.getSeconds()}s` : '--'}
                </span>
              </div>
              <div className='item'>
                <span className='label'>Placed on</span>
                <span className='value' id='placedOn'>{game.formattedMove || '--'}</span>
              </div>
              

               
              <div className='item timeLeftInGame'>
                <span className='timeBar' style={timeBarStyleGame} />
              </div>
              
              <div className='item timeLeftInRound'>
                <span className='timeBar' style={timeBarStyleRound} />
              </div>
              
              
              <h2>Current game info:</h2>
              <div className='item'>
                <span className='label'>Game-Clock</span>
                <span className='value' id='gameclock'>
                  {game.gameState ? '' : 'Next game starts in: '}
                  {game.gameState ?
                    game.timeLeftInGame.getMinutes() : game.timeLeftInPause.getMinutes()}m
                  &nbsp;
                  {game.gameState ?
                    game.timeLeftInGame.getSeconds() : game.timeLeftInPause.getSeconds()}s
                </span>
              </div>
              <div className='item'>
                <span className='label'>Players on your team</span>
                <span className='value' id='yourTeamSize'>
                  {game.currentTeamPlayers}
                </span>
              </div>
              <div className='item'>
                <span className='label'>Players total</span>
                <span className='value' id='totalPlayers'>
                  {game.blackPlayers + game.whitePlayers}
                </span>
              </div>
  
              <h2>Tokens:</h2>
              <div className='item'>
                <span className='label'>Tokens you have</span>
                <span className='value' id='yourTokens'>123</span>
              </div>
              <div className='item'>
                <span className='label'>Money donated so far</span>
                <span className='value' id='moneyDonated'>8888 €</span>
              </div>
  
              <p><span className='button' id='buyTokensButton'>Buy Tokens</span></p>
  
            </div>
  
            <div className='liveCam clear'>
              <img src='http://bixcam.kunsthausgraz.at/out/stream/webcam2_x.jpg' alt='bix Livecam' />
            </div>
          </div>
        </div>
  
        <div className='layer' id='helpLayer'>
          <div className='layerInner'>
  
            <h2>Help: How to play, How Go Works (page #6)</h2>
            <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
              invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
              accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
              sanctus est Lorem ipsum dolor sit amet.</p>
          </div>
        </div>
  
        <div className='layer' id='buyTokens'>
          <div className='layerInner'>
  
            <h2>Send ETH to this Wallet:</h2>
            <p>Infotext, Infotext</p>
            <div className='walletQR'>HIER KOMMT DER WALLET-QR-CODE REIN</div>
  
          </div>
        </div>
  
      </div>
    )
  }  
}

export default GameBoard;
