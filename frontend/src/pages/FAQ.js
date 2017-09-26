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
    $('.accordionTitle').click(function(){
      $(this).parent().find('.accordionContent').slideDown(500);
    });
     
    
    

 

  }

  render() {
    return (
      <div>
      
        <div className='field' id='frequentlyAskedQuestions'>
          <div className='fieldInner'>
            <h2>Frequently Asked Questions</h2>
            <p>We hope to answer all your questions here.<br />
            If your question is not covered here, please check out our <a href="https://p4p.lab10.coop/whitepaper.pdf" target="_blank">whitepaper</a>.</p>
            
            
            <h3>GENERAL QUESTIONS</h3>
            
            <div className="accordion">           
              <h4 className="accordionTitle">What is Blockchain?</h4>
              <div className="accordionContent">
                <p>Blockchain, the technology behind Bitcoin and other crypto-currencies, seems to be the driving technology behind the next generation Internet, also referred to the Decentralized Web, or the Web3. Blockchain is a novel solution to the age-old human problem of trust. It provides an architecture for so called trustless trust. It allows us to trust the outputs of the system without trusting any actor within it.</p>
                <p>Board games like Go show how decision-making works and convey the underlying principles of "consensus" and "finality" in complex networks. These paradigms are also used by the blockchain, the underlying technology of crypto-currencies like Bitcoin. The blockchain allows "transparent anonymity" that allows anybody to participate anonymously while displaying the results publicly.</p>
                <p>Blockchain is a shared, trusted, public ledger of transactions, that everyone can inspect but which no single user controls. It is a distributed database that maintains a continuously growing list of transaction data records, cryptographically secured from tampering and revision.</p>
                <p>Read more: <a href="https://blockchainhub.net/blockchain-intro/" target="_blank">https://blockchainhub.net/blockchain-intro/</a></p>      
              </div>
            </div>
            


            <div className="accordion">           
              <h4 className="accordionTitle">What is a token?</h4>
              <div className="accordionContent">
                <p>A token is a digital asset issued into a decentralized system. Each cryptocurrency token embodies a tradable good. A token is hosted on another currency’s blockchain (in our case Ethereum). This is the difference to a coin, having its own blockchain.</p>
              </div>
            </div>



            <div className="accordion">           
              <h4 className="accordionTitle">What is a wallet?</h4>
              <div className="accordionContent">
                <p>A wallet stores the public and private keys which can be used to receive or spend the cryptocurrency and tokens.</p>
                <p>There are different types of wallets such as software wallets, hardware wallets or paper wallets. A paper wallet is a document that contains copies of the public and private keys that make up a wallet.</p>
              </div>
            </div>


            <div className="accordion">           
              <h4 className="accordionTitle">What is Go and what are the rules of game?</h4>
              <div className="accordionContent">
                <p>Go (WeiQi, Baduk) is an abstract strategy board game for two players, in which the aim is to surround more territory than the opponent.</p>
                <p>The rules are easy to learn! Check out the simple rules (<a href="https://senseis.xmp.net/?BasicRulesOfGo" target="_blank">https://senseis.xmp.net/?BasicRulesOfGo</a>) or dive a little deeper with the advanced rules (<a href="http://gobase.org/studying/rules/doc/a4.pdf" target="_blank">http://gobase.org/studying/rules/doc/a4.pdf</a>). </p>
                <p>Or just watch and learn. We are sure you will figure it out in just a few minutes.</p>
              </div>
            </div>


            <div className="accordion">           
              <h4 className="accordionTitle">What is the motivation behind this project?</h4>
              <div className="accordionContent">
                <p>By playing Go, the project <strong>Play4Privacy</strong> creates awareness for privacy in general and the blockchain in particular in the most playful and interesting manner possible.</p>
                <p>With Play4Privacy we would like to convey the idea of <strong>transparent anonymity</strong>. 
The basic idea is the following: Everybody should be able to participate anonymously, at the same time the game is displayed openly visible to everyone. The players are anonymous, but the whole process of the game, the number of participants, their moves and the outcome is open and transparent, and as such a metaphor for the Blockchain.</p>
              </div>
            </div>



            <div className="accordion">           
              <h4 className="accordionTitle">How many tokens will be generated (mined)?</h4>
              <div className="accordionContent">
                <p>The mining of PLAY-tokens is done in the form of a public art performance. All PLAY-tokens will be created between September 27th and October 27th 2017 through playing the strategy game Go (WeiQi, Baduk) on the public facade of the Museum of Modern Arts (Kunsthaus) in Graz, Austria.</p>
                <p>For every token mined by a player, a supplement coin is generated to sell.</p>
                <p>The number of tokens generated depends on the number of players & games during this time.</p>
                <p>There will not be any mining after October 27th 2017. This is the natural limit of token supply.</p>
              </div>
            </div>




            <h3>PARTICIPATION</h3>


            <div className="accordion">           
              <h4 className="accordionTitle">How do I participate in the game?</h4>
              <div className="accordionContent">
                <p>When you join, you will be assigned to one of the two teams (black, white). 
No sign-up. Play for free and anonymously.</p>
                <p>Supported by a consensus algorithm, each team sets their stones in their quest for surrounding more territory than the opponent. Every player is rewarded with a PLAY-token for their suggestion for the next move.</p>
              </div>
            </div>
            
            
            <div className="accordion">           
              <h4 className="accordionTitle">How/when can I join or leave the game?</h4>
              <div className="accordionContent">
                <p>The game is live from September 27th until October 27th 2017 – daily from 7 to 10pm CEST. During this time, you can play and generate PLAY-tokens. Join the game.</p>
                <p>Each team has 20 sec each per move. The game automatically ends after 30 minutes. However, you can join or leave the game any time you wish. In either case, you can redeem your tokens.</p>
              </div>
            </div>
            
            
            <div className="accordion">           
              <h4 className="accordionTitle">How/when do I generate and get my PLAY tokens?</h4>
              <div className="accordionContent">
                <p>Generate one token every 20 seconds. Just continue playing and collect more tokens.</p>
                <p>When the game ends or you leave the current game, you can redeem your tokens. This application gives you the possibility to send the tokens to your existing wallet or create a new wallet.</p>
              </div>
            </div>
            
            
            <div className="accordion">           
              <h4 className="accordionTitle">Do I already need a wallet to participate?</h4>
              <div className="accordionContent">
                <p>No. If you already have a wallet, we can send the PLAY tokens there after the game.</p>
                <p>If you do not have a wallet, we help you to export the virtual wallet and export it for further usage. </p>
              </div>
            </div>
            
            <div className="accordion">           
              <h4 className="accordionTitle">How can I get tokens without playing the game?</h4>
              <div className="accordionContent">
                <p>You can also save your precious time and bid Ether for PLAY tokens!
Because for every token mined, a supplement coin is generated to sell. Donate in order to participate in the distribution of these tokens.</p>
              </div>
            </div>
            
            
            <h3>TECHNOLOGY, PLATFORM, ROADMAP and OUTLOOK</h3>
            
            <div className="accordion">           
              <h4 className="accordionTitle">What is Proof-of-PLAY?</h4>
              <div className="accordionContent">
                <p>Play4Privacy introduces a novel concept to “mine” crypto-currencies similar to Bitcoin. It is called “proof-of-PLAY” and rewards every Go-player with virtual tokens (coins) for playing the game, no matter if they won or lost. For every valid move the players gets one token.</p>
                <p>Thus, this project puts the human at the centre of value creation, not machines.</p>
              </div>
            </div>
            
            
            
            <div className="accordion">           
              <h4 className="accordionTitle">What value does PLAY platform provide?</h4>
              <div className="accordionContent">
                <p>The platform PLAY enables other crypto-projects to build a vast user base and reach out to the public - far beyond the crypto-space. It provides a gamified way to attract and sign-up and convert people into crypto-enthusiasts!</p>
                <p>PLAY offers a solution to convert people into crypto users by offering a simple and gamified funnelling system. In a market like the one we are in right now, projects collect a lot of funds to start their development – what they lack is users. By allowing them to host real world events with a gamified sign up and user collection mechanism, these clients get the chance to collect valuable token holders and users far beyond the crypto space. PLAY tokens will be used to host these games.</p>
                </div>
            </div>
            
            
            
            
            <div className="accordion">           
              <h4 className="accordionTitle">What’s the value of PLAY token?</h4>
              <div className="accordionContent">
                <p>As your Proof-of-PLAY you receive your tokens right playing. Because you have invested time and mind, the tokens already have some inherent value. </p>
                <p>25% of all tokens will be sold through an auction. 100% of the funds will be contributed to non-profit organisations fighting for privacy. </p>
                <p>After the mining phase, the tokens can be traded on an exchange. This defines the market value of the PLAY token. </p>
                <p>Of course – this is no investment advice and prices cannot be predicted.</p>
              </div>
            </div>
            
            
            <div className="accordion">           
              <h4 className="accordionTitle">But what can I do with the PLAY-tokens after the project?</h4>
              <div className="accordionContent">
                <p>You can store your tokens 100% anonymously in your browser or export them to (and generate) an external Ethereum wallet.</p>
                <p>After the public proof-of-PLAY phase from September 27th and October 27th 2017, the tokens can be traded on an exchange. We offer the possibility to redeem the tokens to host further games like Play4Privacy in the future – in exchange for tokens.</p>
                <p>We want to build a platform of glocal gaming with that. In this stage, the whole process does not necessarily have to be about donating funds to charity anymore.</p>
                <p>So, token holders could host games for other causes or profits and give out self-issued tokens (e.g. ICO tokens of their project) as a proof-of-play (e.g. during bounty hunting for an ICO-project).
Collect one token for every move, every 20 seconds. </p>
                
                
                </div>
            </div>
            


            <div className="accordion">           
              <h4 className="accordionTitle">Who is behind the project?</h4>
              <div className="accordionContent">
                <p>The lab10 collective, based out of Graz, Austria, is an incubator focusing on blockchain. Our 21 passionate members work on various projects related to decentralisation, privacy and education.<br />
We share the vision: `We want to support the transition to a free, educated and fair society`.</p>
                <p>Find more information about the team members in our <a href="https://p4p.lab10.coop/whitepaper.pdf" target="_blank">whitepaper</a>.</p>                
                
              </div>
            </div>
            

            <h3>PRIVACY ASPECTS of this project</h3>

            <div className="accordion">           
              <h4 className="accordionTitle">How are funds raised for privacy?</h4>
              <div className="accordionContent">
                <p>For every token mined, a supplement coin is generated to sell. These tokens are sold before and after the mining phase through an auction. 100% of the money raised is donated to non-profit-privacy organisations who do good work in the area of protection of privacy.</p>                
              </div>
            </div>
            
            <div className="accordion">           
              <h4 className="accordionTitle">Which privacy organisations will receive the funds?</h4>
              <div className="accordionContent">
                <p>This information will be avaliable soon!</p>
              </div>
            </div>
            


          </div>
        </div>
        
      </div>
    );
  }
}

export default Credits;
