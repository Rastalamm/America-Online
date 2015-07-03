var PORT = 8000;
var socketIO = require('socket.io');
var SOCKET_CONNECTION = 'connection';
var SOCKET_USER_MESSAGE = 'user message';
var SOCKET_USER_REGISTRATION = 'user registration';
var SERVER_USER = 'Mr. Server';


var server = socketIO.listen(PORT);
var usernameList = {};


server.sockets.on(SOCKET_CONNECTION, function(socket){
  console.log('you have a connection');

  socket.on(SOCKET_USER_MESSAGE, function(message){
    console.log(message);
    socket.broadcast.emit(SOCKET_USER_MESSAGE, socket.username, message)
  })


  socket.on(SOCKET_USER_REGISTRATION, function(username, callback){

    console.log('username', username);


    if( usernameList.hasOwnProperty(username)){
      callback(false);
    }else{
      usernameList[username] = username;

      socket.username = username;

      socket.broadcast.emit(SOCKET_USER_REGISTRATION, SERVER_USER, username + 'joined')

      callback(true);

    }

  });


});