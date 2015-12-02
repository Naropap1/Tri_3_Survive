var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bullID = 0;
var curID = 0;
var nameArray = ["bob","joe","mary","jane","tony","brony"];
var players = new Object;
//support parsing post request bodies
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('static'));

io.on('connection', function(socket) {
	
	//iniate as ''
	var myName = nameArray[curID];
	//create socket on new player with parameter name which is passed to the emit
	players[myName] = '';
	io.emit('new-player',nameArray[curID],players);
	//myName = name
	curID++;

	socket.on('update-player', function(score,newX,newY,newvX,newvY,newbR,newPlayers){
		players=newPlayers;
		io.emit('update-player',myName,score,newX,newY,newvX,newvY,newbR);
	});

	socket.on('new-bullet', function(originX,originY,bvX,bvY,ownerName){
		io.emit('new-bullet',originX,originY,bvX,bvY,bullID,ownerName);
		bullID+=1;
	});

	socket.on('rem-bullet',function(bID,personHit){
		io.emit('rem-bullet',bID,personHit);
	});

	socket.on('rem-player',function(){
		io.emit('rem-player',myName);
		delete players[playerName];
		myName = '';
	});

	socket.on('disconnect', function(){
		if(myName !== ''){
			delete players[myName];
			io.emit('rem-player',myName);
		}
 	 });

	socket.on('chat-message', function(msg) {
		io.emit('chat-message', msg);
	});
});

http.listen(3333, function(){
  console.log('listening on *:3333');
});