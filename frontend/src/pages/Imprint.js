import React from 'react';
import $ from 'jquery';
import 'jquery.scrollto';

class Credits extends React.Component {
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
      $('header nav').slideUp(500);
    });

    // Button ScrollTo Layer / Top
    $('.button').click(() => {
      $.scrollTo(0, 250);
    });

    // Show Layers
    $('.accordionTitle').click((e) => {
      $(e.currentTarget).parent().find('.accordionContent').slideDown(500);
    });
  }

  /* eslint-disable */

  render() {
    return (
      <div>
      
        <div className='field' id='imprint'>
          <div className='fieldInner'>
            
            <h2>Imprint</h2>
            
            <p>lab10 collective eG<br />
            registered cooperative with limited liability<br />
            Strauchergasse 13<br />
            8020 Graz, Austria<br />
            <br />
            E-Mail: office@lab10.coop<br />
            </p>
            
            <p>
            VAT-No.: ATU72523557<br />
            Jurisdiction: Graz<br />
            Commercial Register Nr.: FN 474612 i (Landesgericht für ZRS Graz)<br />
            </p>

            <p><strong>Auditing Association:</strong><br />
            Rückenwind – Förderungs- und Revisionsverband gemeinwohlorientierter Genossenschaften</p>
            
            <p><strong>Corporate purpose:</strong><br />
            We believe it needs a free and educated society to handle the challenges of the future and create a prosperous living environment without massive power concentrations – hence, our focus will be: Decentralization & Privacy. The means for this are provided by cryptography, the internet and public Blockchain systems.<br /><br />
The lab10 collective will mainly work on software projects, educate teenagers and foster a real shared economy, without exploitation of people.</p>

            <p><strong>Membership:</strong><br />
            Chamber of Commerce, Information and Consulting<br />
            Relevant laws which apply for the collective can be found under <a href="http://www.ris.bka.gv.at" target="_blank">www.ris.bka.gv.at</a><br /></p>
            
            <p><strong>Executive Board:</strong><br />
            DI Thomas Zeinzinger (chairman)<br />
            Dietmar Hofer (vice chairman)<br />
            DI Sandra Zitz<br />
            <br />
            Information obligation pursuant to §5 Austrian E-Commerce Act (ECG),<br />
            §14 Austrian Commercial Code (UGB) and disclosure obligation pursuant to §§24, 25 Austrian Media Act (MedienG).
            </p>
            

          </div>
        </div>
        
        

        <div className='field' id='privacy'>
          <div className='fieldInner'>
            
            <h2>Privacy Disclaimer</h2>
            
            <p>From all visitors who have not turned on the Do-Not-Track-Header (http://donottrack.us/) we collect, analyze and store on OUR server the following data for a maximum of 6 months:</p>
            <ul>
              <li>Masked IP Address in the form of 192.168.xxx.xxx</li>
              <li>Date and time</li>
              <li>URL of current and previous page</li>
              <li>Browser / Device / Operating System</li>
              <li>Local time and screen resolution</li>
              <li>Page generation time</li>
              <li>Clicked links to downloads and outside pages</li>
            </ul>
            
            <p>All gathered data will only be used for internal analytics and we refuse using any 3rd party services. We do take appropriate measures to secure our server, so that others can’t access data stored there.</p>
            <p>If you want to know more about privacy and the tool we use, follow the following link: https://piwik.org/privacy/</p>
            
            <h3>Specifics for Play4Privacy:</h3>
            <p>The ETH address / ID is stored in the browser (localStorage) to make it possible to re-use the wallet for consecutive game sessions. This ID is also stored in server logs, to be able to reproduce what happened if something goes wrong.</p>
            <p> Note that this ID is also stored as hash in the Ethereum blockchain as part of „proof of play“. We take care that this ID and the data collected by the server (as explained above) will not be linked together.</p>
            <p>After 6 months, we delete all user data and keep only over-all statistics (i.e. users per country, average time played).</p>

          </div>
        </div>



        <div className='field' id='legal'>
          <div className='fieldInner'>
            
            <h2>Legal Disclaimer</h2>
            
            <p>The PLAY Token (Symbol: PLY) is a crypto token which will be generated by Proof-of-Play and has therefore some inherent value because players spend their time to play and mine the coin. At the beginning this value is only virtual and there is no way to exchange PLAY Token with other real-world currencies or cryptocurrencies. The project team intends to have PLY listed on different virtual currency exchanges and to have the market value of PLY increase over time by developing the PLAY platform. However, there is no guarantee that the development of the platform and / or the increase of the PLYs market value will succeed. Right now, the fun and educational aspect of the project is the most relevant aspect, lab10 collective eG is not liable for any not fulfilled expectation of participants in the market value development of the tokens or in the project development.</p>
            <p>Player rewards in the form of PLAY tokens can be collected or donated to a pool after the first completed game and further PLAY tokens can be collected and donated to a pool in consecutive games. If a player decides to donate to a pool then there is no possibility to revert that decision. There is furthermore no right to collect or donate PLAY tokens, because due to hardware or software problems such as but not exclusively limited to low internet connectivity or a software bug, it might happen, that players will not be able to get their reward.</p>
            <p>The distribution of PLAY tokens will be the following:</p>
            
            <ul>
              <li>People which donate Ether (ETH) to non-profit organizations fighting for privacy (e.g. epicenter.works) will get 40% of all PLAY tokens as a reward</li>
              <li>Players will get up to 50% of all PLAY tokens, minus the ones which are donated to the lab10 collective eG for further development of the PLAY platform</li>
              <li>10% of all PLAY tokens will go to the core team</li>
            </ul>
            
            <p>Please note that the Ether transfer is an anonymous donation and no purchase of the PLAY token will be done, the amount of the donation only serves as a measure for the distribution of the available PLAY tokens. Early donations (Sept. 25th – 27th) will get the double amount of PLAY tokens per ETH compared to donations done after the game phase (Oct. 29th – 31st). All donations done are final and cannot be withdrawn. The whole process is anonymous, therefore no donate confirmations can be issued.</p>
            <p>Which and how many organizations will get donations depends on the amount collected and will be decided collectively within a public and transparent voting process. At no time the project team and the lab10 collective eG have access to the donated funds which are secured within a time locked smart contract, only the account details of the receiving organizations can be edited according to the decisions from a later initiated voting process.</p>
            <p>Please note that the use of cryptocurrencies might be regulated or prohibited by law or regulation in different countries (e.g. in Bangladesh, Bolivia, China, Ecuador, Japan or Kyrgyz Republic). Everybody participating in any manner is advised to inform himself/herself about restrictions imposed upon him or her by any jurisdiction other than the laws of Austria.</p>
            <p>Please note that if you lose your private key or password of your wallet there might be no possibility to access your PLAY tokens. When doing transfers be careful to use the correct amount and address, because it is generally impossible to undo a wrong transaction.</p>
            <p>We have carefully written and reviewed the smart contract code to hold the ETH donations, but due to hardware or software problems such as but not exclusively limited to a Solidity vulnerability or a software bug, we can’t be held liable for frozen or stolen funds.</p>
            

          </div>
        </div>

        
      </div>
    );
  }
}

export default Credits;
