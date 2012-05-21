$(function(){
  //Create invisible squares
  //<div id="a8" class="square ui-droppable" >a8</div>
  var alphaCoords = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  for (var i=8; i>0; i--)
    for (var j=0; j<8; j++)
      $('#board').append('<div class="square ui-droppable" id="' + alphaCoords[j] + i + '"></div>');

  //Make squares droppable
  $(".square").each(function(e){
    $(this)
      .css({'z-index':'1'})
      .droppable({
        drop: function(event,ui){
          from=ui.draggable.attr('id').slice(1,3);
          to=$(this).attr('id');
          send(from+"-"+to,"");
        }
      });
  });

  //Add images to piece elements
  $('#board>div.piece').each(function(e){
    //Load piece image
    var piece=$(this).text().split(/ /);
    piece_bg="url(pieces/"+piece[1]+piece[0]+".svg) no-repeat";
    $(this).css({'background':piece_bg, 'background-size':"100%,100%"})
    //Dragging ability
    $(this).draggable({'containment':'parent'})
  });

  //Rig the console:
  $(document).keyup(function(event){
    //route key to chat window
    //if ENTER then send that message
    if(event.keyCode==13){
      send($('#chat').val(),"");
      $('#chat').val("");
    }
  });


});

