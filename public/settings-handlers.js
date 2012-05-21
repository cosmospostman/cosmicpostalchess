// ***SETTINGS***
//Settings expanding bar
$("#settings").click(function(){
  //Hack: clone expander content, insert, measure width, remove
  //Hack #2: add a 10ms delay for clone to render properly before
  //  measuring width
  e=$("#expander").clone().css({opacity: 0.0, float: 'left'});
  $("body").append(e);
  setTimeout(function(){
    w=e.width();
    $("#expander").width(w);
    $("#expander-outer").css({display:'block'}).animate({width:w}, 'slow');
    $(e).remove();
  },10)
  //End hack
});

$("#settings").mouseleave(function(){
  timeOutID = setTimeout(function(){
    $("#expander-outer").animate({width:0}, 'slow', function(e){$(this).hide()}); }
    ,1000);
  $("#settings").mouseenter(function(){clearTimeout(timeOutID)});
});

//Zoom functionality
$("#zoomIn").click(function(){
  sqSide++;
  if( 9*sqSide+80<$(document).height() && 10*sqSide+280<$(document).width() ) resizeBoard(sqSide);
  else sqSide--;
});
$("#zoomOut").click(function(){
  if(sqSide>33) sqSide--;
  resizeBoard(sqSide);
});

//Rotate board
$("#rotateBoard").click(function(){
  rotateBoard();
});

//Animations
$("#set-animations").click(function(e){
  $.fx.off=!$.fx.off;
  $(this).removeClass("set-no").removeClass("set-yes");
  if($.fx.off) $(this).addClass("set-no");
  else $(this).addClass("set-yes")
});
