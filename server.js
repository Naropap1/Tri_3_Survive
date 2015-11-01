var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//support parsing post request bodies
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('static'));

io.on('connection', function(socket) {
	
	socket.on('chat-message', function(msg) {
		io.emit('chat-message', msg);
	});
});

http.listen(3333, function(){
  console.log('listening on *:3333');
});