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
        
      </div>
    );
  }
}

export default Credits;
