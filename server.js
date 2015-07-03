var PORT = 8000;
var socketIO = require('socket.io');
var SOCKET_CONNECTION = 'connection';
var SOCKET_USER_MESSAGE = 'user message';


var server = socketIO.listen(PORT);


server.sockets.on(SOCKET_CONNECTION, function(socket){
  console.log('you have a connection');

  socket.on(SOCKET_USER_MESSAGE, function(message){
    console.log(message);
    socket.broadcast.emit(SOCKET_USER_MESSAGE, message)
  })


});