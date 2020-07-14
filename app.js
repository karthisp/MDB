const mysql = require("mysql"); 
const express = require("express");
const request = require("request");
const bodyParser = require("body-parser"); 	

const app = express();

var urlencodedParser = bodyParser.urlencoded({ extended: false });

/*==========================
 	Mysql Connection
==========================*/

var connection = mysql.createConnection({
	host : "localhost",
	user : "newuser",
	password : "K@rthik96",
	database : "Movies_DB"
});

// connect ENOENT /Applications/MAMP/tmp/mysql/mysql.sock

connection.connect(function(error){
	if(error){
		console.log(error.stack);
	} else{
		console.log(`Connection successfull`);
	}
});


app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.get('/', function(req, res){
	connection.query('SELECT * FROM users', function(error, results){
		if(!error){
			console.log(results[0].user_id);
		} else{
			console.log(error);
		}
		connection.end();
		res.render("home");
	});	
});

app.get('/result', function(req, res){
	let searchName =  req.query.search;
	request('http://www.omdbapi.com/?apikey=thewdb&s='+searchName, function(error, response, body){
		if(!error && response.statusCode == 200){
			let parseId = JSON.parse(body)
			res.render("result", {parseId: parseId});
		} else {
			console.log(error);
		}
	})
});

app.get('/title/:movie_title', function(req, res){
	let film = req.params.movie_title;
	request('http://www.omdbapi.com/?apikey=thewdb&t='+film, function(error, response, body){
		if(!error && response.statusCode == 200){
			let parseId = JSON.parse(body);
			res.render('title', {parseId:parseId});
		} else {
			console.log(error);
			console.log(response.statusCode);
		}
	});

});

app.get('/title/:movie_title/comments/new', function(req, res){
	let film = req.params.movie_title;
	res.render('reviews/new', {film:film});
});


app.post('/title/:movie_title/comments', urlencodedParser, function(req, res){
	let movie = "req.params.movie_title";

		res.redirect('/title/movie');
});


app.listen(3000, function(){
	console.log("M ready");
});