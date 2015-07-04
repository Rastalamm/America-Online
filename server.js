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


server.sockets.on(SOCKET_CONNECTION, function (socket){
  console.log('you have a connection');
  //allows admin to run commands on users
  adminMessageOut(socket)

  //adds an array of the time of the messages to each socket
  socket.timeCheck = [];
  socket.strikes = 0;

  socket.on(SOCKET_USER_MESSAGE, function (message){

    rateChecker(message, socket)

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


  socket.on(SOCKET_DISCONNECT, function(){
    //removes the socket
    delete(usernameList[socket.username]);
    //sends a message to all users that they left
    if( socket.username !== undefined){
      socket.broadcast.emit(SOCKET_USER_MESSAGE, SERVER_USER, socket.username + ' has left the building.')
    }
    //updates the userlist on each room
    server.emit(USER_LIST_UPDATES, usernameList);
  })

});

function rateChecker(message, socket){
  socket.timeCheck.unshift(Date.now())

  if(socket.timeCheck.length > 4){
    if(socket.timeCheck[0] - socket.timeCheck[4] < 5000){

      socket.strikes += 1

      switch (socket.strikes){

        case 1:
        socket.emit(SOCKET_USER_MESSAGE, SERVER_USER, 'Too many too quick, wait 5 seconds')
        break;

        case 2:
        socket.emit(SOCKET_USER_MESSAGE, SERVER_USER, 'I\'m warning you...')
        break;

        case 3:
        socket.emit(SOCKET_USER_MESSAGE, SERVER_USER, 'strikeout!')
        kickOutUser(socket.username, 'sent too many messages too quickly.', socket);
        break;

        default:
        process.stdout.write(socket.username + ' impossible!');
      }

      //Messages to the socket
      socket.emit(SOCKET_USER_MESSAGE, socket.username, message);

    }else{
      //sends the messages back to everyone
    server.emit(SOCKET_USER_MESSAGE, socket.username, message)
    }
  }else{
    //sends the messages back to everyone
    server.emit(SOCKET_USER_MESSAGE, socket.username, message)
  }
}


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
//not working
    case '~userlist':
      console.log('Current Users', usernameList);
    break;

    default:
      //some code
    break;

  }
}

function kickOutUser(user, message, socket){

  if(socket.username === user){

    //emits a message to all other users who was kicked out and why
    server.emit(SOCKET_USER_MESSAGE, SERVER_USER, socket.username + ' was kicked out bec/ they ' + message);

    //need to change the users page
    socket.emit(KICKED_OUT_USER, user, message)

    //writes a message to the server
    process.stdout.write('IP: ' + socket.handshake.address + ' has been kicked out \n');

    //Add the IP and username to blacklist
    blackListIp.push(socket.handshake.address)
    blackListUserNamess.push(user);

    //removes user from all other lists
    socket.broadcast.emit(USER_LIST_UPDATES, usernameList);
    socket.disconnect();
  }



}