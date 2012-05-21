//Specify vendor directory
//require.paths.unshift(__dirname+"/vendor");

var http = require('http'),
    sys  = require('sys'),
    fs   = require('fs'),
    url  = require('url'),
    nodeStatic=require('node-static'),
    faye = require('faye');
var bayeux = new faye.NodeAdapter({
  mount:    '/faye',
  timeout:  45
});

var server = http.createServer(function(request,response){
  var file = new nodeStatic.Server(__dirname+'/public', {
    cache: false //while in development
  });

  request.addListener('end', function(){
    var location = url.parse(request.url, true),
          params = (location.query || request.headers);
    file.serve(request,response);
  });
});

function userList(){
  this.users=new function(){};       
  this.add=function(id,name){
    this.users[id]=name;
    if(name=="") delete this.users[id];
  }
}

currentUserList=new userList();
newUserList=new userList();

function refreshUserList(){
  currentUserList=newUserList;
  newUserList=new userList();
  client.publish("/users",{userlist:JSON.stringify(currentUserList.users)});
  //Every 60 seconds
  setTimeout(refreshUserList, 60000)
}

//server.listen(process.env['app_port']);
//console.log("Listening on port "+process.env['app_port']);
server.listen(8080);
bayeux.attach(server);
client=bayeux.getClient();
refreshUserList();

client.subscribe('/newUser', function(message){
  currentUserList.add(message.id, message.name);
  newUserList.add(message.id, message.name);
  client.publish("/users",{userlist:JSON.stringify(currentUserList.users)});
})
