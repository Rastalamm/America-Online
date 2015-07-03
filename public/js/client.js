(function (){

  var SERVER_ADDRESS = 'http://localhost:8000';
  var SOCKET_CONNECT = 'connect';
  var SOCKET_DISCONNECT = 'disconnect';
  var SOCKET_RECONNECT = 'reconnect';
  var SOCKET_RECONNECTING = 'reconnecting';
  var SOCKET_ERROR = 'error';



  var SYSTEM = 'System';
  var socket = io.connect(SERVER_ADDRESS);



  socket.on(SOCKET_CONNECT, function(){
    message(SYSTEM, 'Connected to ' + SERVER_ADDRESS)
  })














})();