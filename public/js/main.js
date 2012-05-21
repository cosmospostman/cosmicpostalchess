$(function(){
  //Create invisible squares
  //<div id="a8" class="square ui-droppable" >a8</div>
  var alphaCoords = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  for (var i=8; i>0; i--)
    for (var j=0; j<8; j++)
      $('#board').append('<div class="square ui-droppable" id="' + alphaCoords[j] + i + '"></div>');

});

