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

//log in - checks that user exists and password is correct
//first argument is username, second is password
app.get('/users/*/*', function(req, res) {
	var response;
	db.serialize(function() {
	db.all("SELECT * FROM users WHERE username = ?", req.params[0], function(err, rows) {
		//error in database
		if(err)	{
			//console.log("db error in get users");
			//console.log(err);
			response = {status: "database"};
			res.send(response);
			return;
		}
		else {
			//if username not found (i.e. user doesn't exist)
			if(rows.length == 0) {
				response = {status: "username"};
				res.send(response);
				return;
			}
			
			//incorrect password
			if(rows[0].password != req.params[1]) {
				response = {status: "password"};
				res.send(response);
				return;
			}
			
			//successful login
			response = {status: "success",
						username: rows[0].username,
						highscore: rows[0].highscore,
						kills: rows[0].totalkills,
						deaths: rows[0].totaldeaths};
			res.send(response);
			return;
		}
	});
	});
	
	return;
});

//get profile statistics after logged in
app.get('/users/*', function(req, res) {
	var response;
	
	db.serialize(function() {
	db.all("SELECT * FROM users WHERE username = ?", req.params[0], function(err, rows) {
		//error in database
		if(err)	{
			//console.log("db error in get users");
			//console.log(err);
			response = {status: "database"};
			res.send(response);
			return;
		}
		else {

			response = {highscore: rows[0].highscore,
						kills: rows[0].totalkills,
						deaths: rows[0].totaldeaths};
						
			res.send(response);
			return;
		}
	});
	});
	
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
			//console.log(err);
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

//Deletes user account
app.delete('/users/*', function(req, res) {
	var response;
	var user = req.params[0];
	
	db.serialize(function() {
	db.run("DELETE FROM users WHERE username = ?", user, function(err) {
		if(err) {
			console.log(err);
			response = {status: "fail"};
			res.send(response);
			return;
		}
		else {
			response = {status: "success"};
			res.send(response);
			return;
		}
	});
	});
	
});

//start server
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

http.listen(server_port, server_ip, function(){
  console.log('listening on *:3333');
});