// ***INIT***
//Generate sessionID and set other configuration items
//TODO config.json
var seshID= Math.floor(Math.random()*parseInt(String((new Date()).getTime()).replace(/\D/gi,''))).toString(16);
var sqSide = 40;
var lock=false;
var cfg={
  myID:0,
  myName:"",
  myColour:"",
  oppID:1,
  oppName:"",
  oppColour:"",
  blackImg:"pieces/bp.svg",
  whiteImg:"pieces/wp.svg",
  gameID:""
}
var client = new Faye.Client('/faye', {timeout:120});                   

// ***LOGIN HANDLERS***

//Heartbeat
function heartbeat(){
  client.publish("/newUser", {name:cfg.myName, id:seshID});
  heart=window.setTimeout("heartbeat()",55000)
}
$(window).unload(function(){
  client.publish("/newUser", {name:"UNLOAD", id:"0"})
})

  //Set my name
  $('#askNameForm').submit(function(){
    cfg.myName=$('#askNameInput').val()
    heartbeat();
    $('#askName').hide();
    $('#chooseOpp').fadeIn();
    return false;
  });

  //Rig accept/decline buttons
  $('#decline').click(function(){
    sendRequest(cfg.seshID, cfg.oppID, cfg.myColour, cfg.oppColour, "DECLINED");
  });
  $('#accept').click(function(){
    sendRequest(seshID, cfg.oppID, cfg.myColour, cfg.oppColour, "ACCEPTED",cfg.gameID);
  });

  //When userlist changes
  client.subscribe("/users", function(message){
    $('#userlist').empty();
    users=jQuery.parseJSON(message.userlist);
    for (var key in users){
      if(users.hasOwnProperty(key)){
        newUser=$('#userlist').append("<li>"+users[key]+"</li>");
        $('#userlist>li:last').data('id',key);
      }
      self.userList=users;
    }
  //Ask users for a game (add handlers for new <li> elements)
    $('#userlist>li').click(function(){
      p1ID=seshID;
      p2ID=$(this).data('id');
      if(Math.random()>0.5) {p1c="white"; p2c="black" }
      else                  {p1c="black"; p2c="white" }
      sendRequest(p1ID, p2ID, p1c, p2c, "REQUEST", "");
      $('#chooseOpp').hide();
      $('#startGame').fadeIn();
    });
  });

  function sendRequest(from,to,fromColour,toColour,msg,gID){
    client.publish("/connect", {
       from: from
      ,to: to
      ,fromColour: fromColour
      ,toColour: toColour
      ,message: (msg || "")
      ,gID: (gID||"")
    });
  }

  //Listen for requests and act on them
  client.subscribe("/connect", function(message){
    console.log(message);
    // FROM US
    if(message.from==seshID){
      if (message.message=="ACCEPTED") {newGame(cfg.gameID); return false;}
      if (message.message=="SWAP") {
        $('#buttons').hide();
        $('#wait').show();
        pawnSwap();
        return false;
      }
      $('#buttons').hide();
      cfg.oppID=message.to;
      cfg.oppName=userList[message.to];
      cfg.myColour=message.fromColour;
      cfg.oppColour=message.toColour;
      //Pawn icons
      $('.myPawnImg').attr('src',cfg[message.fromColour+"Img"]);
      $('.oppPawnImg').attr('src',cfg[message.toColour+"Img"]);
      //Names
      $('.oppName').each(function(){ $(this).text(cfg.oppName) });
      $('.myName').each(function(){ $(this).text(cfg.myName) });
    }
    //TO US, (from our partner OR unlocked)
    if(message.to==seshID && (message.from==cfg.oppID || lock==false) ){
      //Set lock
      if(lock==false){
        $('#chooseOpp').hide();
        $('#startGame').fadeIn();
        lock=true;
      }
      if (message.message=="DECLINED") {declineInvite(); return false;}
      if (message.message=="ACCEPTED") {newGame(cfg.gameID); return false;}
      if (message.message=="SWAP") {
        $('#buttons').show();
        $('#wait').hide();
        pawnSwap();
        return false;
      }
      $('#wait').hide();
      cfg.oppID=message.from;
      cfg.oppName=userList[message.from];
      cfg.myColour=message.toColour;
      cfg.oppColour=message.fromColour;
      //Pawn icons
      $('.myPawnImg').attr('src',cfg[message.toColour+"Img"]);
      $('.oppPawnImg').attr('src',cfg[message.fromColour+"Img"]);
      //Names
      $('.oppName').each(function(){ $(this).text(userList[message.from]) });
      $('.myName').each(function(){ $(this).text(cfg.myName) });
    }
  });

function declineInvite(){
  lock=false;
  oppID="";
  $('#startGame').hide();
  $('#chooseOpp').fadeIn();
}

function pawnSwap(){
  myOldColour=cfg.myColour;
  oppOldColour=cfg.oppColour;
  cfg.myColour=oppOldColour;
  cfg.oppColour=myOldColour;
  p1=$('#bPawn').position().left;
  p2=$('#wPawn').position().left;
  $('#bPawn').animate({'left':p2});
  $('#wPawn').animate({'left':p1});
}

function newGame(gameID){
  cfg.gameID=gameID;
  $('#startGame').fadeOut();
  $('#home').fadeOut( function(){ $("#game").fadeIn() });
  setGameVars(client,cfg);
  createBoard();
  //Kill the new user heartbeat
  window.clearTimeout(heart);
  //TODO stop receiving other msgs
}

  //Swap pawns
  $('#switcher').click(function(){
    sendRequest(seshID, cfg.oppID, cfg.oppColour, cfg.myColour, "SWAP" );
  });
  
//DEV-only: skip login and go to game
//  $('#askName').hide();
//  newGame('');

