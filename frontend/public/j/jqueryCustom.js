// A $( document ).ready() block.
$( document ).ready(function() {
	
	
	/* Show / Hide Layers via Buttons */


	/* Gameboard */
    $('#helpButton').click(function(){
        $(".layer#helpLayer").addClass("showLayer");
    }); 

    $('#joinGameButton').click(function(){
        $(".layer").removeClass("showLayer");
    }); 
	
		
    $('#buyTokensButton').click(function(){
        $(".layer#buyTokens").addClass("showLayer");
    }); 
    
    
    /* Credits */
    $('#ethYesButton').click(function(){
        // $(".layer#buyTokens").addClass("showLayer");
        // $(".field#buyTokens").addClass("showLayer");
    }); 
    
    $('#ethNoButton').click(function(){
        // $(".layer#buyTokens").addClass("showLayer");
        // $(".field#buyTokens").addClass("showLayer");
    }); 


	/* Endgame */
	
	$('#redeemYourCoinButton').click(function(){
        // $(".layer#redeemCoinDecision").addClass("showLayer");
        // $(".field#redeemCoinDecision").addClass("showLayer");
    }); 
	
	
	
	$('#redeemCoinYesButton').click(function(){
        // $(".layer#redeemCoin").addClass("showLayer");
        // $(".field#redeemCoin").addClass("showLayer");
    }); 
    
    $('#redeemCoinNoButton').click(function(){
        // $(".layer#buyTokens").addClass("showLayer");
        // $(".field#buyTokens").addClass("showLayer");
    }); 

    $('#redeemCoinSend').click(function(){
        // $(".layer#buyTokens").addClass("showLayer");
        // $(".field#buyTokens").addClass("showLayer");
    });     
    
	
	
	

});