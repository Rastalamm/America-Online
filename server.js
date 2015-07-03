var PORT = 8000;
var socketIO = require('socket.io');
var SOCKET_CONNECTION = 'connection';
var SOCKET_DISCONNECT = 'disconnect';
var SOCKET_USER_MESSAGE = 'user message';
var SOCKET_USER_REGISTRATION = 'user registration';
var USER_LIST_UPDATES = 'update username list';
var USER_MENTIONED = 'mentions';
var SERVER_USER = 'Mr. Server';

var server = socketIO.listen(PORT);
var usernameList = {};


server.sockets.on(SOCKET_CONNECTION, function(socket){
  console.log('you have a connection');

  socket.on(SOCKET_USER_MESSAGE, function(message){

    server.emit(SOCKET_USER_MESSAGE, socket.username, message)

  })


  socket.on(SOCKET_USER_REGISTRATION, function(username, callback){
    if( usernameList.hasOwnProperty(username) || username === '' ){
      callback(false);
    }else{

      usernameList[username] = username;

      socket.username = username;

      server.emit(SOCKET_USER_MESSAGE, SERVER_USER, username + ' joined')

      callback(true);
      console.log('New User: ', socket.username);

    server.emit(USER_LIST_UPDATES, usernameList);
    }
  });

  socket.on(USER_MENTIONED, function (){
    console.log('a mention');
  });




  socket.on(SOCKET_DISCONNECT, function(){
    delete(usernameList[socket.username]);

    if( socket.username !== undefined){
      socket.broadcast.emit(SOCKET_USER_MESSAGE, SERVER_USER, socket.username + ' has left the building.')
    }



    console.log('updated list', usernameList);
    server.emit(USER_LIST_UPDATES, usernameList);
  })

});
