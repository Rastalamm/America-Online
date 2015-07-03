(function (){

  var SERVER_ADDRESS = 'http://localhost:8000';
  var SOCKET_CONNECT = 'connect';
  var SOCKET_DISCONNECT = 'disconnect';
  var SOCKET_RECONNECT = 'reconnect';
  var SOCKET_RECONNECTING = 'reconnecting';
  var SOCKET_ERROR = 'error';
  var SOCKET_USER_MESSAGE = 'user message';
  var SOCKET_USER_REGISTRATION = 'user registration';


  var SYSTEM = 'System';
  var socket = io.connect(SERVER_ADDRESS);


  socket.on(SOCKET_CONNECT, function(){
    message(SYSTEM, 'Connected to ' + SERVER_ADDRESS)
  })

  socket.on(SOCKET_DISCONNECT, function(){
    message(SYSTEM, 'Disconnect from ' + SERVER_ADDRESS)
  })

  socket.on(SOCKET_RECONNECT, function(){
    message(SYSTEM, 'Reconnected to ' + SERVER_ADDRESS)
  })

  socket.on(SOCKET_RECONNECTING, function(){
    message(SYSTEM, 'Reconnecting to ' + SERVER_ADDRESS)
  })

  socket.on(SOCKET_ERROR, function(){
    if(err !== undefined){
      message(SYSTEM, err);
    }else{
      message(SYSTEM, 'An unknown error occured');
    }
  })

  socket.on(SOCKET_USER_MESSAGE, function (from, userMessage){
    message(from, userMessage)
  })



  function message(from, message){
      var newMessage = $('<p>');
      var fromTag = $('<b>', {
        text : from
      });
      var messageTag = $('<span>', {
        text : message
      });


      newMessage.append(fromTag);
      newMessage.append(messageTag);
    $('#chatlog').append(newMessage).get(0).scrollTop = 1000000000;
  }


  $('#messageform').submit(function(){

    var messageField = $('#message');
    var theMessage = messageField.val();

    message('User', theMessage);

    socket.emit(SOCKET_USER_MESSAGE, theMessage)

    messageField.val('');

    return false;
  });


  $('#registration_form').submit(function(){

    var username = $('#username').val();

    console.log('username', username);

    socket.emit(SOCKET_USER_REGISTRATION, username, function (available){

      if (available){
        changeStateOfChatRoom();
      }
      else{
        $('#username_error').text('Username has been taken!');
      }
    });

    return false;
  });


  var registration = $('#registration');
  var chatRoom = $('#chatroom');

  chatRoom.hide();

  function changeStateOfChatRoom (){
    chatRoom.show();
    registration.hide();
  };




})();