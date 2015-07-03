var PORT = 8000;
var socketIO = require('socket.io');
var SOCKET_CONNECTION = 'connection';


var server = socketIO.listen(PORT);


server.sockets.on(SOCKET_CONNECTION, function(socket){
  console.log('you have a connection');

});