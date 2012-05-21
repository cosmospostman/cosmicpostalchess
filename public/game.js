//Subscribe to common message path
//Should really use same var as parent script for faye
client = new Faye.Client('/faye', {timeout:120});
var gameID;
var seshID;

// ***CREATE***
function createBoard(){
  canCastle={w:true, b:true};

  $(".piece").each(function(e){
    $(this).css('display', 'block');
  });

  if(cfg.myColour=='black'){rotateBoard()}
  else movePiecesToSquares();

}

function movePiecesToSquares(){
  //Place piece
  //Set position to square specified in this.text()
  $("#board>div.piece").each(function(e){
    toSquare=$(this).attr('id').slice(1,3);
    move_piece(toSquare,toSquare);
  });
}

// ***BOARD ROTATION***
function rotateBoard(){
  $("#board").append('<div id=\'newTop\'></div>');
  newTop=$("#newTop");
  for(i=0; i<64; i++){
    newTop.after($("#board>div.square:first"));
  }
  newTop.remove();
  movePiecesToSquares();
}

// ***RESIZE***
//Set board size in px, resize pieces to fit
function resizeBoard(side){
  var fx=false; //Remember FX setting
  if($.fx.off!=true) {fx=true; $.fx.off=true; }
  //Resize board, square, pieces
  $('#board').height(side*8).width(side*8);
  $('#board').css({top: side, left: side});
  $(".square").each(function(e){ $(this).height(side).width(side);  });
  $('#board>div.piece').each(function(e){ $(this).height(side).width(side); });
  movePiecesToSquares();
  //Resize application
  $("#app-inner").height(9*side+80).width(10*side+280);
  $("#app-inner").css({top: (9*side+80)/-2, left: -(12*side+200)/2});
  $("#control").height(9*side+80);
  $("#console-container").height(9*side+80-44);
  if(fx==true) $.fx.off=false;
}

function setGameVars(fayeClient, cfg){
  gameID=gameID||"noSpecifiedGameID"; //for testing purposes
  seshID=seshID;
  moveCounter=1;
  whoseMove="white";
  self.cfg=cfg;
  p2pComms='/games/'+gameID;

  //Recieve a move packet
  client.subscribe(self.p2pComms, function(message){
    //Do regex here for more obscure move decoding eg Pa1-b1
    thisMove=message.move.match(/^((([R,N,B,K,Q,r,n,b,k,q]?[a-h][1-8]([-]|[x])[R,N,B,Q,r,n,b,q]?[a-h][1-8](\(ep\))?)|0-0|0-0-0)([+]{1,2})?)|(DRAW)|(RESIGN)$/g);
    self.thisMoveString="";
    //Remove leading character from eg. Kg1
    //Display alternatives 0-0 0-0-0 ep + ++ DRAW RESIGN    //Check rest of message isn't whitespace

    if(thisMove!=null){
      self.thisMoveString=thisMove[0];
      //Split into components, [0]-[1]
      thisMoveComponents=thisMove[0].match(/[R,N,B,K,Q,r,n,k,q,b]?[a-h][1-8]/g);
      if(thisMoveComponents!=null){
        from=thisMoveComponents[0].slice(-2); //last 2 characters sliced, eg. Rg1
        to=thisMoveComponents[1].slice(-2);
        if(pType(from)=="p") type=""; else type=pType(from).toUpperCase();
        if(pieceAt(to)) take="x"; else take="-";
        legalMove=move(from,to); //move() returns true if it was legal.
        if(legalMove){
          //What to write on the console (use jQuery's inArray)
          moveText=type+from+take+to;
          if(type=="K" && $.inArray(from,["e1","e8"])>-1){
           if($.inArray(to,["c1","c8"])>-1) moveText="0-0-0";
           if($.inArray(to,["g1","g8"])>-1) moveText="0-0";}
          $('#console>ol>li:last>span:first').append(moveText+" ");
          clockSwap();
        }
      }     
    }

    //Remove the chess notation from the message and see if there's
    //anything else (other than whitespace) to send to chat.
    thisChatMessage=message.move.replace(self.thisMoveString, "");
    if(thisChatMessage.match(/^(\s)+$/)==null && !thisChatMessage==""){
      chatClass=message.from+"Chat";
      if ($('#console>ol>li:last>ul>li:last').hasClass(chatClass)) chatClass=chatClass+" noBalloon"
      $('#console>ol>li:last>ul').append("<li class=\"chatEntry "+chatClass+"\">"+thisChatMessage+"</li>");
    }

    //New move entry
    if(thisMove!=null && message.from=="black" && legalMove) $('#console>ol').append("<li><span>"+ ++moveCounter +".</span><ul></ul>");

  });

  $('#'+cfg.myColour+"Timer>span:first").text(cfg.myName);
  $('#'+cfg.oppColour+"Timer>span:first").text(cfg.oppName);
  clockTick("white");

}

function send(move){
  client.publish(p2pComms, {from: cfg.myColour, move:move });
}

//Convenience functions return information about a square
function p(at){ return $('#_'+at).text() } //entire description
function pieceAt(at){ if($('#_'+at).length>0) return true; return false;  } //a piece exists
function pType(at){ return $('#_'+at).text().slice(0,1) } //Type
function pColour(at){ return $('#_'+at).text().slice(2,4) } //Colour
function move_piece(from,to){
  //Move piece to requested square
  piece=$('#_'+from);
  piece.attr('id','_'+to);
  toTop=$('#'+to).position().top;
  toLeft=$('#'+to).position().left;
  piece.animate({top:toTop, left:toLeft});
}

//Move wrapper to check for special cases
function move(from,to){
  function castle(side,rank){
    //Check that the path is clear and rook is present
    if(side=="Q" && pType('a'+rank)=='r' && !(pieceAt('b'+rank)||pieceAt('c'+rank)||pieceAt('d'+rank)))
      { move_piece('a'+rank,'d'+rank); }
    else if(side=="K" && pType('h'+rank)=='r' && !(pieceAt('f'+rank)||pieceAt('g'+rank)))
      { move_piece('h'+rank,'f'+rank); } 
    else throw "illegalMove";
  }

  piece=$('#_'+from);
  try{
    if(from==to) throw "illegalMove";
    //Castling
    //White
    if(p(from)=="k w"){
      if(to=='c1' && canCastle.w) castle("Q",1)
      if(to=='g1' && canCastle.w) castle("K",1)
      canCastle.w=false;
    }
    //Black
    if(p(from)=="k b"){
      if(to=='c8' && canCastle.b) castle("Q",8)
      if(to=='g8' && canCastle.b) castle("K",8)
      canCastle.b=false;
    }
    
    //'Take' a piece if it's on the to square
    if(pieceAt(to) && from!=to){
      capture=$('#_'+to);
      if(pColour(to)==pColour(from)) throw "illegalMove";
      capture.hide('explode');
      capture.remove();
    }

    //The guts
    move_piece(from,to);
    
    //Update console
    name=pType(piece).toUpperCase();
    $('#console').val(name+from+'-'+to);
    return true;
  }
  catch(exception){
    if(exception=="illegalMove"){
      oldSquare=$('#'+piece.attr('id').slice(1,3))
      piece.animate({'top':oldSquare.position().top, 'left':oldSquare.position().left });
      return false;
    }
  }
}
