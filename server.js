var PORT = 8000;
var socketIO = require('socket.io');
var SOCKET_CONNECTION = 'connection';
var SOCKET_DISCONNECT = 'disconnect';
var SOCKET_USER_MESSAGE = 'user message';
var SOCKET_USER_REGISTRATION = 'user registration';
var SOCKET_USER_REGISTRATION_COMPLETE = 'registration complete';
var SERVER_USER = 'Mr. Server';



var server = socketIO.listen(PORT);
var usernameList = {};

server.sockets.on(SOCKET_CONNECTION, function(socket){
  console.log('you have a connection');

  socket.on(SOCKET_USER_MESSAGE, function(message){

    socket.broadcast.emit(SOCKET_USER_MESSAGE, socket.username, message)
  })


  socket.on(SOCKET_USER_REGISTRATION, function(username, callback){



    if( usernameList.hasOwnProperty(username) || username === '' ){
      callback(false);
    }else{

      usernameList[username] = username;

      socket.username = username;

      socket.broadcast.emit(SOCKET_USER_MESSAGE, SERVER_USER, username + ' joined')

      callback(true);
      console.log('New User: ', socket.username);

    }


    socket.broadcast.emit(SOCKET_USER_REGISTRATION_COMPLETE, usernameList)


  });


socket.on(SOCKET_DISCONNECT, function(){
  console.log('user has left', socket.username);

  socket.broadcast.emit(SOCKET_USER_MESSAGE, SERVER_USER, socket.username + ' has left the building.')

})

});

// server.sockets.on(SOCKET_DISCONNECT, function(){
//   console.log('user has left' socket.username);
// })
