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
  
  
            
            <div className="accordion">           
              <h3 className="accordionTitle">How does a blockchain work?</h3>
              <div className="accordionContent">
                <p>Lore Ipsum dolor sit Amet.</p>
              </div>
            </div>
            
            
            <div className="accordion">           
              <h3 className="accordionTitle">Why is this game and PLAY-Blockchain transparent?</h3>
              <div className="accordionContent">
                <p>Lore Ipsum dolor sit Amet.</p>
              </div>
            </div>
            
            
            <div className="accordion">           
              <h3 className="accordionTitle">What is “mining” in the blockchain and how are tokens mined in this blockchain?</h3>
              <div className="accordionContent">
                <p>Lore Ipsum dolor sit Amet.</p>
              </div>
            </div>
            
            
            <div className="accordion">           
              <h3 className="accordionTitle">What is a wallet?</h3>
              <div className="accordionContent">
                <p>Lore Ipsum dolor sit Amet.</p>
              </div>
            </div>
            
            <div className="accordion">           
              <h3 className="accordionTitle">How can I create my own personal wallet?</h3>
              <div className="accordionContent">
                <p>Lore Ipsum dolor sit Amet.</p>
              </div>
            </div>
            
            <div className="accordion">           
              <h3 className="accordionTitle">How can I move tokens (coins) from one wallet to the next wallet?</h3>
              <div className="accordionContent">
                <p>Lore Ipsum dolor sit Amet.</p>
              </div>
            </div>
            
            
            
            <div className="accordion">           
              <h3 className="accordionTitle">What shall I do with the tokens that I have earned?</h3>
              <div className="accordionContent">
                <p>Lore Ipsum dolor sit Amet.</p>
              </div>
            </div>
            
            
            
            
            <div className="accordion">           
              <h3 className="accordionTitle">What is the worth of one token?</h3>
              <div className="accordionContent">
                <p>Lore Ipsum dolor sit Amet.</p>
              </div>
            </div>
            
            
            <div className="accordion">           
              <h3 className="accordionTitle">Is PLAY a cryptocurrency?</h3>
              <div className="accordionContent">
                <p>Lore Ipsum dolor sit Amet.</p>
              </div>
            </div>
            
            
            <div className="accordion">           
              <h3 className="accordionTitle">What is the museum of modern Arts in Graz?</h3>
              <div className="accordionContent">
                <p>Lore Ipsum dolor sit Amet.</p>
              </div>
            </div>
            
            



           
      
            
            


          </div>
        </div>
        
      </div>
    );
  }
}

export default Credits;
