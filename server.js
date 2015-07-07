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
var PRIVATE_MESSAGE = 'private message';

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

    //uncomment for IP check on registration
    if(blackListUserNamess.indexOf(username) > -1 /*|| blackListIp.indexOf(socket.handshake.address) > -1*/){
      callback(false, 'You\'ve been banned son');
    }else{

      if( usernameList.hasOwnProperty(username) || username === '' ){
        callback(false, 'Username has been taken!');
      }else{

        usernameList[username] = username;

        socket.username = username;

        server.emit(SOCKET_USER_MESSAGE, SERVER_USER, username + ' joined')

        callback(true);
        console.log('New User: ', socket.username);

      server.emit(USER_LIST_UPDATES, usernameList);
      }
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

    data = data.substring(0, data.length-1);

    if(data.split(' ').length > 2){

      data = data.split(' ')

      command = data.splice(0,1).toString();
      user = data.splice(0,1).toString();
      message = data.join(' ');

      commands(command, user, message, socket);
    }else{
      data = data.split(' ')

      command = data.splice(0,1).toString();
      user = data.splice(0,1).toString();

      commands(command, user, 'null', socket)
    }
  })
}

function commands(command, user, message, socket){

  switch(command){
    case '~kick':
      kickOutUser(user, message, socket);
    break;

    case '~ban' :
      banUser(user, socket);
    break;

//not working
    case '~unban':
      unBanUser(user, socket);
    break;

    case '~userlist':
      console.log(Object.keys(usernameList));
    break;

    default:
      //some code
    break;

  }

}


function unBanUser (user, socket){
  //removes the username from the ban list
  if(blackListUserNamess.indexOf(user) > -1){
    blackListUserNamess.splice(blackListUserNamess.indexOf(user),1);
  }

//removes the IP address from the ban list
  if(blackListIp.indexOf(user) > -1){
    blackListIp.splice(blackListIp.indexOf(user),1);
  }
}

function banUser (user, socket){

  if(user === socket.username){
    blackListIp.push(socket.handshake.address)
    blackListUserNamess.push(user);

 //emits a message to all other users who was kicked out and why
    server.emit(SOCKET_USER_MESSAGE, SERVER_USER, socket.username + ' was banned');
//writes a message to the server
    process.stdout.write('User: ' + socket.username +' with the IP: ' + socket.handshake.address + ' has been banned \n');

    finalGoodbye(user, socket)
  }

}


function kickOutUser(user, message, socket){

  if(user === socket.username){
    //emits a message to all other users who was kicked out and why
    server.emit(SOCKET_USER_MESSAGE, SERVER_USER, socket.username + ' was kicked out bec/ they ' + message);

    //writes a message to the server
    process.stdout.write('IP: ' + socket.handshake.address + ' has been kicked out \n');

    finalGoodbye (user, socket, message);

  }
}


function finalGoodbye (user, socket) {
    //removes user from all other lists
    //need to change the users page
  if(user === socket.username){
    socket.emit(KICKED_OUT_USER)

    socket.broadcast.emit(USER_LIST_UPDATES, usernameList);
    socket.disconnect();
  }
}