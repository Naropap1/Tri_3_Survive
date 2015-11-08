var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('users');

db.run("create table if not exists users (username varchar(100) primary key, password varchar(100), highscore int, totalkills int, totaldeaths int)");

//support parsing post request bodies
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('static'));

//socket messages go in here
io.on('connection', function(socket) {
	
	socket.on('chat-message', function(msg) {
		io.emit('chat-message', msg);
	});
});

//handling ajax calls

//log in - returns row for user and checks password on client end
app.get('/users/*', function(req, res) {
	var response;
	db.serialize(function() {
	db.all("SELECT * FROM users WHERE username = ?", req.params[0], function(err, rows) {
		if(err)	{
			console.log("db error in get users");
			console.log(err);
			response = {};
			res.send(response);
			return;
		}
		else {
			if(rows.length == 0) {
				response = {username: ""};
				res.send(response);
				return;
			}
			
			response = {username: rows[0].username, 
						password: rows[0].password,
						highscore: rows[0].highscore,
						kills: rows[0].totalkills,
						deaths: rows[0].totaldeaths};
			res.send(response);
			return;
		}
	});
	});
	//res.send(response);
	return;
});

//creates a new user
app.post('/users', function(req, res) {
	var postBody = req.body;
	var name = postBody.username;
	var pass = postBody.password;
	
	var response;
	
	db.serialize(function() {
	db.run("INSERT INTO users (username, password, highscore, totalkills, totaldeaths) VALUES (?, ?, ?, ?, ?)", [name, pass, 0, 0, 0] , function(err) {
		if(err) {
			console.log(err);
			response = {status: "invalid"};
			res.send(response);
			return;
		}
		else {
			response = {status: "success",
						username: name, 
						password: pass,
						highscore: 0,
						kills: 0,
						deaths: 0};
			res.send(response);
			return;
		}
	});
	});
});

http.listen(3333, function(){
  console.log('listening on *:3333');
});