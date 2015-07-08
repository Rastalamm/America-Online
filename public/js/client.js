(function (){

  var SERVER_ADDRESS = 'http://localhost:8000';
  var SOCKET_CONNECT = 'connect';
  var SOCKET_DISCONNECT = 'disconnect';
  var SOCKET_RECONNECT = 'reconnect';
  var SOCKET_RECONNECTING = 'reconnecting';
  var SOCKET_ERROR = 'error';
  var SOCKET_USER_MESSAGE = 'user message';
  var SOCKET_USER_REGISTRATION = 'user registration';
  var USER_LIST_UPDATES = 'update username list';
  var USER_MENTIONED = 'mentions';
  var KICKED_OUT_USER = 'kicked out user';


  var SYSTEM = 'System';
  var socket = io.connect(SERVER_ADDRESS);
  var clientUsername;

  // socket.on(SOCKET_CONNECT, function(){
  //   message(SYSTEM, 'Connected to ' + SERVER_ADDRESS)
  // })

  socket.on(SOCKET_DISCONNECT, function(){
    kickedOutPage();
  })

  // socket.on(SOCKET_RECONNECT, function(){
  //   message(SYSTEM, 'Reconnected to ' + SERVER_ADDRESS)
  // })

  // socket.on(SOCKET_RECONNECTING, function(){
  //   message(SYSTEM, 'Reconnecting to ' + SERVER_ADDRESS)
  // })

  socket.on(SOCKET_ERROR, function(){
    if(err !== undefined){
      message(SYSTEM, err);
    }else{
      message(SYSTEM, 'An unknown error occured');
    }
  })

  socket.on(SOCKET_USER_MESSAGE, function (from, userMessage){
    checkForMention(from, userMessage);
  })

  socket.on(USER_LIST_UPDATES, function (usernameList, username){
    updateUserLst(usernameList);
  })

  socket.on(KICKED_OUT_USER, function (user, userMessage){
    kickedOutPage();
  })

  function message(from, message){
      var newMessage = $('<p>');
      var fromTag = $('<b>', {
        text : from + ':'
      });
      var messageTag = $('<span>', {
        html : message
      });

      newMessage.append(fromTag);
      newMessage.append(messageTag);
    $('#chatlog').append(newMessage).get(0).scrollTop = 1000000000;
  }

  $('#messageform').submit(function(){

    var messageField = $('#message');
    var theMessage = messageField.val();

    socket.emit(SOCKET_USER_MESSAGE, theMessage, clientUsername)

    messageField.val('');

    return false;
  });


  $('#registration_form').submit(function(){

    var username = $('#username').val();

    socket.emit(SOCKET_USER_REGISTRATION, username, function (available, message){

      if (available){
        clientUsername = username
        changeStateOfChatRoom();
      }
      else{
        $('#username_error').text(message);
      }
    });

    return false;
  });


  var registration = $('#registration');
  var chatRoom = $('#chatroom');
  var usersOnline = $('#usersonline');

  chatRoom.hide();
  usersOnline.hide();

  function changeStateOfChatRoom (){
    chatRoom.show();
    usersOnline.show();
    registration.hide();
  };

  function updateUserLst(usernameList){

    var userList = $('#userlist');

    userList.empty();

    for(key in usernameList){
      usernameList[key]
      var userListBox = $('<li>', {
        text : usernameList[key]
      });

      userList.append(userListBox);
    }
  }

  function kickedOutPage (){
    chatRoom.hide();
    usersOnline.hide();
    registration.show();
  }

  function checkForMention (from, userMessage){

    var findThisUn = '@' + clientUsername;

    var mentionSpan = $('<span>',{
      text : clientUsername + ' ',
      class : 'mention'
    });

    userMessage = userMessage.replace(findThisUn, mentionSpan.get(0).outerHTML );

    message(from, userMessage)
  }


})();