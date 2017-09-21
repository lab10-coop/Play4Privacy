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
            <h3>GENERAL QUESTIONS</h3
            
            <div className="accordion">           
              <h3 className="accordionTitle">What is the Blockchain?</h3>
              <div className="accordionContent">
                <p>The Internet has been built on the concept of decentralization. Unfortunately over the last decades that principle has been corrupted by the formation of large, centralized networks controlled by few, gigantic internet companies like Google, Facebook, Apple and others.</p>
              <p>A free and open internet morphed into territories of gated communities leading to monopolies in many areas, like social networks, internet search or online advertising. All these corporations collect their users‘ data aggressively, analyze and process it to turn it into profit. – „data is the new gold“.</p>
              <p>There are a number of possibilities to counter this development. One example is the „Darknet“ or „Deep Web“, which is a network built to hide the identities of their participants. Internet corporations cannot mine that network for personalized data.</p>
              <p>Another example is the Blockchain, which also builds on anonymity, in a public, distributed database which is not and can not be controlled by a centralized institution.</p>      
              </div>
            </div>
            
          

            <div className="accordion">           
              <h3 className="accordionTitle">What is the reason behind this project?</h3>
              <div className="accordionContent">
                <p>With the P4P project we would like to convey the idea of transparent anonymity. The basic idea is the following: Everybody should be able to participate anonymously, at the same time the game is displayed openly visible to everyone.The players are anonymous, but the whole process of the game, the number of participants, their moves and the outcome is open and transparent, and as such a metaphor for the Blockchain.</p>
              </div>
            </div>
            
            
            <div className="accordion">           
              <h3 className="accordionTitle">Why did you use a game for this?</h3>
              <div className="accordionContent">
                <p>Most classical games, like GO, have a lot in common with the Blockchain conceptually. Through them the Blockchain becomes intuitively understandable. When you think of games you think that they are not serious, they are just for enjoyment. But actually, there is hardly any other area in life where we are as serious about rules as in games.</p>
                <p>It is exactly the same with the Blockchain. You can see a game as a sequence of decisions which, once made, are irreversible. You try to find an inner consensus on the best move to make, but once the decision is made, it is done. Like in the Blockchain. The first step is to collaboratively get to a consensus what should be written into the next block, once the consensus is accepted and the decision made the block is added to the Blockchain, like a move in a game, and can never be reversed or changed. This way the concepts of „consensus“ and „finality“ are realized. It is the same in a game like GO as it is in the Blockchain.</p>
              </div>
            </div>
            
            
            <div className="accordion">           
              <h3 className="accordionTitle">What do you do with the collected donations made by paying players?</h3>
              <div className="accordionContent">
                <p>100% of the money raised is donated to non-profit-privacy organisations who do good work in the area of protection of privacy.</p>
              </div>
            </div>
  
  


            <h3>PARTICIPATION</h3


            <div className="accordion">           
              <h3 className="accordionTitle">How do I participate?</h3>
              <div className="accordionContent">
                <p>Just join the game and start playing. That is all you need to do – no need to sign up or enter anything else.</p>
              </div>
            </div>
            
            
            <div className="accordion">           
              <h3 className="accordionTitle">What do I need to to when I joined the game?</h3>
              <div className="accordionContent">
                <p>All you have to do is play the game. If you do not know how to play „Go“ just look at our help screen, we prepared an instruction and some videos for you. You can also just try to play the game and look at what other players do.</p>
              </div>
            </div>
            
            
            <div className="accordion">           
              <h3 className="accordionTitle">What is the game duration?</h3>
              <div className="accordionContent">
                <p>Each team has 20 sec each per move. If you game trigger goes green you can make your move. Every game lasts for 20 min and immediately restarts after the time is over. You can always join a new game.</p>
              </div>
            </div>
            
            
            <div className="accordion">           
              <h3 className="accordionTitle">How do I get PLAY tokens?</h3>
              <div className="accordionContent">
                <p>Collect one token for every move, every 20 seconds. Just continue playing and collect more tokens. For every token mined, a supplement coin is generated and donated to non-profit organisations fighting for privacy.</p>
              </div>
            </div>
            
            <div className="accordion">           
              <h3 className="accordionTitle">When does a game end?</h3>
              <div className="accordionContent">
                <p>The game ends automatically after 20 min. But you can always hit the „End Game“ button if you do not want to play anymore. In this case you will be redirected to the summary screen where you can redeem your PLAY tokens.</p>
              </div>
            </div>
            
            
            <h3>THE CONCEPT OF PROOF-OF-PLAY AND FUTURE OUTLOOK<h3>
            
            <div className="accordion">           
              <h3 className="accordionTitle">What is Proof-of-Play?</h3>
              <div className="accordionContent">
                <p>Our intent is to explain the topic of Blockchain, we not only want to excite people who already know about cryptocurrency, but also those who never heard about it before. We want to offer a playful way to develop an understanding how such systems work. Such systems usually create value by proof-of-work (burning energy).</p>
                <p>With P4P however we want to put the human at the centre of value creation, not machines. In the P4P project it is the act of playing a game which generates the cryptocurrency. The mining method of Bitcoin is called „proof of work“, but in P4P it is „proof of play“.</p>
              </div>
            </div>
            
            
            
            <div className="accordion">           
              <h3 className="accordionTitle">How do I get this cryptocurrency?</h3>
              <div className="accordionContent">
                <p>At the end of each game all players get the option to get a token.</p>
                <p>All who already have a virtual wallet will get that coin added there.</p>
                <p>Players without a virtual wallet get instructions how to create such a wallet or can choose the option to donate the token to the development team – if they do not want to create a wallet.</p>
              </div>
            </div>
            
            
            
            
            <div className="accordion">           
              <h3 className="accordionTitle">Can you say anything about the initial value of this crypto-token?</h3>
              <div className="accordionContent">
                <p>As your Proof-of-Play you get the token after you played and therefore it will already have some inherent value as you your time to play the game. Of course – this is no investment advice and prices cannot be predicted.</p>
              </div>
            </div>
            
            
            <div className="accordion">           
              <h3 className="accordionTitle">But what can I do with the PLAY-tokens after the project?</h3>
              <div className="accordionContent">
                <p>After the project phase the tokens can be traded and we offer the possibility to redeem the tokens to host further games like play4privacy in the future – in exchange for tokens.</p>
                <p>We want to build a platform of glocal gaming with that. In this stage the whole process does not necessarily have to be about donating funds to charity anymore.</p>
                <p>So, token holders could host games for other causes or profits and give out self-issued tokens (e.g. ICO tokens of their project) as a proof-of-play (e.g. during bounty hunting for an ICO-project).</p>                
              </div>
            </div>
            
            


          </div>
        </div>
        
      </div>
    );
  }
}

export default Credits;
