var PORT = 8000;
var socketIO = require('socket.io');
var SOCKET_CONNECTION = 'connection';
var SOCKET_DISCONNECT = 'disconnect';
var SOCKET_USER_MESSAGE = 'user message';
var SOCKET_USER_REGISTRATION = 'user registration';
var USER_LIST_UPDATES = 'update username list';
var USER_MENTIONED = 'mentions';
var SERVER_USER = 'Mr. Server';
var KICKED_OUT_USER = 'kicked out user';

var server = socketIO.listen(PORT);
var usernameList = {};
var blackListUserNamess = [];
var blackListIp = [];


server.sockets.on(SOCKET_CONNECTION, function(socket){
  console.log('you have a connection');
  adminMessageOut(socket)

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

function adminMessageOut(socket){

  process.stdin.setEncoding('utf8');

  process.stdin.on('data', function(data){

    data = data.split(' ')

    command = data.splice(0,1).toString();
    user = data.splice(0,1).toString();
    message = data.join(' ');

    commands(command, user, message, socket);

  })
}

function commands(command, user, message, socket){

  switch(command){
    case '~kick':
      kickOutUser(user, message, socket);
    break;

    case '~userlist':
      console.log('Current Users', usernameList);
    break;

    default:
      //some code
    break;

  }
}

function kickOutUser(user, message, socket){

  console.log('the socket', socket.username);

    if(socket.username === user){


      //emits a message to all other users who was kicked out and why
      server.emit(SOCKET_USER_MESSAGE, SERVER_USER, user + ' was kicked out bec/ they ' + message);

      //need to change the users page
      socket.emit(KICKED_OUT_USER, user, message)

      //removes user from all other lists
      socket.broadcast.emit(USER_LIST_UPDATES, usernameList);
      socket.disconnect();


      //get soockets IP


      //blacklist IP's


      //blacklist usernames



      //blackListIp.push
      //blackListUserNamess.push(clientConnectedList[key].username);
      //console.log('Output', socket.username);
    }
}


