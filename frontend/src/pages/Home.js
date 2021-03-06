import React from 'react';
import { observer, inject } from 'mobx-react';
import $ from 'jquery';
import Board from '../Board';
import gs from '../GameSettings';

@inject('game')
@observer
class Home extends React.Component {
  componentDidMount() {
    // Remove React not working warning
    $('.reactNotWorking').remove();

    // Navigation Mobile
    $('.navTrigger .showButton').click((e) => {
      $(e.currentTarget).slideUp(250).parent().find('.hideButton')
        .slideDown(250);
      $('header nav').slideDown(500);
    });

    $('.navTrigger .hideButton').click((e) => {
      $(e.currentTarget).slideUp(250).parent().find('.showButton')
        .slideDown(250);
      $('header nav').slideUp(500);
    });

    $('header nav a').click(() => {
      $('.navTrigger .hideButton').slideUp(250);
      $('.navTrigger .showButton').slideDown(250);
      $('header nav').fadeOut(200);
    });

    // Show Layers
    $('#newToBockchainButton').click(() => {
      $('.layer#newToBC').addClass('showLayer');
    });
    // Hide Layer
    $('.closeLayerButton').click((e) => {
      $(e.currentTarget).parent().removeClass('showLayer');
    });

    // Refresh LiveCam Feed
    const liveCamPhoto = document.getElementById('liveFeedImage');
    const updateImage = () => {
      liveCamPhoto.src = `${liveCamPhoto.src.split('?')[0]}?${Math.floor(new Date().getTime() / 1000) * 1000}`;
    };
    $('#liveFeedImage').data('interval', setInterval(updateImage, 10000));

    // Set Default Refresh-Rate in Seconds (5 for now)
    $('input.liveCamRefreshValue').val(10).change();

    // Set new Refresh-Rate
    $('input.liveCamRefreshValue').on('input change', (e) => {
      /* Update Text-Info */    
      $('.liveCamRefreshValueOutput').text($(e.currentTarget).val());
      /* Stop & Restart Interval */
      clearInterval($('#liveFeedImage').data('interval'));
      $('#liveFeedImage').data('interval', setInterval(updateImage, $(e.currentTarget).val() * 1000));
    });

    $('.killLiveCamRefesh').click((e) => {
      e.preventDefault();
      clearInterval($('#liveFeedImage').data('interval'));
      $('.liveCamRefreshValueOutput').text(0);
    });
  }

  /* eslint-disable */

  render() {
    const timeBarStyles = {
      width: this.props.game.percentageLeftinGame,
    };
    return (
      <div>
        
        <div className="newToBlockchainWrapper">
          <span id='newToBockchainButton'>New to the blockchain? Click here!</span>
        </div>

        <div className='field projectExplanation'>
          <h2>Play for fun and benefit from the blockchain in real life!</h2>
          <p className="introduction"><strong className="intro">Play `Go`</strong> (WeiQi, Baduk) <br />on a public facade and <strong>earn crypto tokens</strong> for every move you make!</p>
          
          
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
            <p>
            
              <a href='https://p4p.lab10.coop/donate/' target="_blank" title='Play Go and get PLAY Tokens!'>
                <strong>The mining & playing phase has ended.</strong><br />Donate to a charity to secure a significant share of supplement tokens.
              </a>
              
            </p>
            

            
            
            
          </div>
          <div className="clear"></div>
          
        </div>

        <div className='field hide' id='asSeenOn'>
          <div className='fieldInner'>  
          
            
            
          </div>
        </div>


        <div className={`creditsButton field  ${this.props.game.stopped ? 'gamePaused' : ''}`}>
          <p><a className='button' href='gameboard' title='Play Go and get PLAY Tokens!'>PLAY NOW!</a></p>
          <p className="centered">and earn tokens for your decision.</p>

        </div>
        

        <div className={`currentGame field  ${this.props.game.stopped ? 'gamePaused' : ''}`}>
          
          <h2>Current game in progress</h2>

          <div className='liveCam'>
            <figure>
                <img id="liveFeedImage" src={`${gs.getBixcamUrl()}`} alt='bix Livecam' />
                <figcaption>Current Live-Feed from BixCam </figcaption>
            </figure>
            <div className="liveCamRefreshRate">
              <input className="liveCamRefreshValue" type="range" min="2" max="50" step="1" />
              <div className="liveCamRefreshInfo">
                <span className="hideOnMobile">Live-Feed</span> Refresh-Rate: every <span className="liveCamRefreshValueOutput">10</span> Seconds
                <a className="killLiveCamRefesh" href="#" title="Stop Refreshing the Live-Feed at all">Stop Refreshing the Live-Feed at all</a>
              </div>
            </div>
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
                <span className="headline"><strong>The mining & playing phase has ended.</strong><br />
                  <a href="https://p4p.lab10.coop/donate/" target="_blank">Donate to a charity to secure a significant share of supplement tokens.</a><br />
                  <a href="https://twitter.com/play4privacy" target="_blank">Stay tuned and follow us - only on Twitter</a>
                </span>
                


                
              </div>
            </div>
          </div>
        </div>
        
        <div className="field videoField">
          <div className='fieldInner'>
            <a href="https://www.youtube.com/watch?v=u5z8OEdrk6k" target="_blank" title="This game makes you understand and benefit from the blockchain in real life (Play4privacy)">Watch Video on YouTube</a>
          </div>
        </div>
 
        <div className='field projectExplanation'>
          <h2>How does it work?</h2>
          <p>This platform is partly running on a blockchain. Get to know how this technology works in the most playful manner. Just join a team and start playing.</p>
          <p>Supported by a consensus algorithm, each team sets their stones in their quest for surrounding more territory than the opponent. Every player is rewarded with a <a href="https://etherscan.io/token/0xfB41f7b63c8e84f4BA1eCD4D393fd9daa5d14D61" target="_blank">PLAY token</a> for their suggestion for the next move.</p>
          <p>Collect one token for every move, every 20 seconds. <br />
            An <a href="https://ethereum.org/" target="_blank">Ethereum</a> wallet is automatically created in the background when joining the game.<br />
          If you redeem tokens earned by playing, you will be asked for a password. The password protected wallet is then saved in your browser (local storage) for future Go sessions and can be saved for other usage.<br />
          The private key of your wallet never leaves your Computer.</p>
          <p>Every move you propose is signed with the private key of your wallet. This signature is included in the <i>game state</i> which will be made available for every game played on this website.<br />
            A <a href="https://en.wikipedia.org/wiki/Cryptographic_hash_function" target="_blank">hash</a> of the game state will be written to the blockchain (using <a href="https://etherscan.io/address/0x78cb0db58721596bc79dc9d8d8296212d153d804#code" target="_blank">this contract</a>).<br />
            That way, despite the possibility to participate anonymously, progress of the games and the resulting token payouts can be made transparent and auditable.</p>
          <p>For every token mined, a supplement token is generated and transferred into a pool (see <a href="https://etherscan.io/address/0x7e0C7676be340EE8eFB4321abfA4634a7Abfb92c" target="_blank">contract</a>).<br />
            That pool also accepts Ether donations before and after the gaming period.<br />
            At the end, collected Ether is donated to non-profit organisations fighting for privacy.<br />
            The collected PLAY tokens are transferred to the donators proportional to their contribution.</p>
          <div className="hotspots">
            <div className="c33l blockchain">
              <div className="hotspot">
                <h3>Experience the <br />blockchain</h3>
                <div className="icon"></div>
                <p>This platform is partly running <br />on a blockchain.</p>
                <p>Get to know how this technology works in the most playful manner.</p>
              </div>
            </div>
            <div className="c33c reward">
              <div className="hotspot">
                <h3>Get <br />rewarded</h3>
                <div className="icon"></div>
                <p>P4P introduces a novel concept to “mine” crypto-currencies on a <br />proof-of-PLAY basis.</p>
                <p>Every player gets rewarded with these virtual tokens.</p>
              </div>
            </div>
            <div className="c33r privacy">                      
              <div className="hotspot">
                <h3>Play for<br /> a cause</h3>
                <div className="icon"></div>
                <p>For every token mined, <br />a supplement token is generated <br />to auction.</p>
                <p>100% of the funds raised will be donated to non-profit organizations fighting for privacy.</p>
              </div>
            </div>
            <div className="clear"></div>
          </div>
          
          <p>Now it’s your turn to also benefit from the blockchain and cryptocurrencies!</p>
          
        </div>


        <div className={`creditsButton field ${this.props.game.stopped ? 'gamePaused' : ''}`}>
          <p><a className='button' href='gameboard' title='Play Go and get PLAY Tokens!'>Click here to start playing</a></p>
          <p className="centered">and earn tokens for your decision.</p>
        </div>
        
        <div className='field' id='buyPlayTokensDesc'>
          <div className='fieldInner'>  
          
            <h2>Can I also buy PLAY-tokens?</h2>
            <p>Yes. For every token mined, a supplement token is generated to sell. You can bid for these tokens. Secure a significant share of these tokens without investing time to play. The total of your investment will be donated to reputable non-profit organisations fighting for privacy.</p>
            <p>Registration for the auction of PLAY tokens happens only from 25th and 26th of September and from October 29th to 31st 2017.</p>
            <p>You can buy or sell tokens as soon as Play tokens are traded on Exchanges. Date is yet to be announced</p>
            <p><a className='button' href='http://p4p.lab10.coop' title='Play4Privacy project description!'>more information</a></p>
   
            
          </div>
        </div>

        <div className='layer' id='newToBC'>
          <div className='layerInner'>
            <h2>New to blockchain..? I am a newbie!</h2>
            <p>When playing this game, you will understand how the blockchain works and even get rewarded.</p>
            
            <h3>Understand the Blockchain!</h3>
            <p>Board games like Go show how decision-making works and convey the underlying principles of `consensus` and `finality` in complex networks. These paradigms are also used by the blockchain, the underlying technology of crypto-currencies like Bitcoin. The blockchain allows `transparent anonymity` that allows anybody to participate anonymously while displaying the results publicly.</p>

            <h3>Support Privacy!</h3>
            <p>By playing Go, the project Play4Privacy creates awareness for privacy in general and the blockchain in particular in the most playful and interesting manner possible. However, it is not required for the participants to understand the underlying technology to experience its value.</p>


            <h3>Get rewarded!</h3>
            <p>Nevertheless, you will get rewarded with a PLAY-token for your every move you join. Just join in and figure out the rules of the game and the blockchain. You do not need any prior knowledge. We will guide you through!</p>

            <h3>Still things unclear?</h3>
            <p>Check out our <a href="faq" title="Show Frequenty Asked Questions">Frequently Asked Questions</a></p>

          </div>
          <div className="closeLayerButton"></div>
        </div>

        


      </div>
    );
  }
}

export default Home;
