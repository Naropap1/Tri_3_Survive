var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var currId = 0;
var bullID = 0;

var players = new Array();

//support parsing post request bodies
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('static'));

io.on('connection', function(socket) {
	//console.log('user connected');
	var player = {
		id: currId,
		score: 0,
		x: 100,
		y: 100,
		vx:-1,
		vy:-1,
		spawned: true,
		bR:0
	};
	var id = currId;
	io.emit('get-id',currId);
	currId++;
	players.push(player);
	//console.log(players.length);
	io.emit('update-players',players);

	socket.on('update-player', function(newX,newY,newvX,newvY,newbR){
		var index = -1;
		for (var i = players.length - 1; i >= 0; i--) {
			if(players[i].id == id)
				index = i;
		};
		players[index].x=newX;
		players[index].y=newY;
		players[index].vx=newvX;
		players[index].vy=newvY;
		players[index].bR=newbR;
		io.emit('update-players',players);
	});

	socket.on('new-bullet', function(originX,originY,bvX,bvY,ownerID){
		io.emit('new-bullet',originX,originY,bvX,bvY,bullID,ownerID);
		bullID+=1;
	});

	socket.on('rem-bullet',function(bID){
		io.emit('rem-bullet',bID);
	});

	socket.on('disconnect', function(){
		var index = -1;
		for (var i = players.length - 1; i >= 0; i--) {
			if(players[i].id == id)
				index = i;
		};
		players.splice(index,1);
		io.emit('update-players',players);
    	//console.log('user disconnected');
    	//console.log(players.length);
 	 });

	socket.on('chat-message', function(msg) {
		io.emit('chat-message', msg);
	});
});

http.listen(3333, function(){
  console.log('listening on *:3333');
});