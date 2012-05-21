//Pass a string here
function clockTick(colour){
  //Init
  this.element=colour+"Timer";
  if( $("#"+element).data('seconds')==undefined) $("#"+element).data('seconds', 0);
  if(whoseMove==colour){
    window.setTimeout("clockTick('"+colour+"')", 1000);
    s=$('#'+element).data('seconds');
    m=0;
    $('#'+element).data('seconds',s+1); //Increment
    while(s>59){
      s=s-60;
      m++;
    }
    this.sDisplay=s;
    if (s<10) this.sDisplay="0"+s;
    $("#"+element+">span.clock").text(m+":"+this.sDisplay);
  }
}

function clockSwap(){
  lastMove=whoseMove;
  $("#"+whoseMove+"Timer").removeClass("active");
  if(whoseMove=="white") whoseMove="black";
  else if(whoseMove=="black") whoseMove="white";
  $("#"+whoseMove+"Timer").addClass("active");
  window.setTimeout("clockTick('"+whoseMove+"')", 1000);
}

