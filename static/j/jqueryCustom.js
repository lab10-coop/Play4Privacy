 //$( document ).ready(function() {
 jQuery( document ).ready(function( $ ) {
		
	/* 
	 * 2017-07-06
	 *
	 * Markus Bernsteiner, lab10 collective
	*/
	
	var countSteps = Number(1);
	
	
	$( ".place" ).click(function() {
			
	    if(countSteps % 2 == 0) {
			$(this).addClass("black").text(countSteps);
		} else {
			$(this).addClass("white").text(countSteps);			
		}

		$(".dev").text("step: " + countSteps);
		countSteps++;
		
	});	
	
	
	/* thanks for ready our Javascript-Code ;) */

});