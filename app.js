const mysql = require("mysql"); 
const express = require("express");
const request = require("request");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

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
	res.render("home");
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

/********************
	comments section
*********************/

app.get('/title/:movie_title/comments/new', function(req, res){
	let film = req.params.movie_title;
	res.render('reviews/new', {film:film});
});


app.post('/title/:movie_title/comments', urlencodedParser, function(req, res){
	let movie = "req.params.movie_title";

		res.redirect('/title/movie');
});

/*********************
	signup get and post
**********************/

app.get('/sign_up', function(req, res){
	res.render('sign_up.ejs');
});

app.post('/sign_up', urlencodedParser, function(req, res){
	connection.query('SELECT * FROM users WHERE username=?', req.body.username, function(error, result){
		if(result[0].username === req.body.username){
			console.log("Mama a person with this username already exists mama");
			res.redirect("/sign_up");
		} else{
			bcrypt.hash(req.body.password, 10, function(err, hash){
				let user = {username:req.body.username, user_email:req.body.email, user_password:hash}
				connection.query("INSERT INTO users SET ?", user, function(sqlerror, result){
					if(sqlerror){
						console.log("sql signup error "+sqlerror);
						return;
					}
					res.redirect('/login');
				})
			})
		}
	})
});

/*************************
Login get and set
**************************/
app.get('/login', function(req, res){
	res.render("login.ejs");
})

app.post('/login', urlencodedParser, function(req, res){
	connection.query("SELECT * FROM users WHERE username=?", req.body.username, function(error, result){
		if(error){
			console.log("login sql error "+error);
		} else{
			if(bcrypt.compare(req.body.password, result[0].user_password)){
				res.redirect('/');
				console.log(req.session);
			}
		}
	})
})


app.listen(3000, function(){
	console.log("M ready");
});