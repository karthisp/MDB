const mysql = require("mysql"); 
const bcrypt = require('bcrypt');
const express = require("express");
const request = require("request");
const bodyParser = require("body-parser");
const session = require('express-session');
const methodOverride = require("method-override");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(session({
	secret:"keep_calm",
	resave: false,
	 saveUninitialized: true
}));

/*==========================
 	Mysql Connection
==========================*/
const connection = mysql.createConnection({
	host : "localhost",
	user : "newuser",
	password : "K@rthik96",
	database : "Movies_DB"
});

connection.connect(function(error){
	if(error){
		console.log(error.stack);
	} else{
		console.log(`DB Connection successfull`);
	}
});

/*Method override*/
app.use(methodOverride('_method'));

/*****************************
					Routes
******************************/
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.get('/', function(req, res){
	let user = req.session.user;
	req.session.path = '/';
	res.render("home",{user:user});
});

app.get('/result/', function(req, res){
	let searchName =  req.query.search;
	let user = req.session.user;
	request('http://www.omdbapi.com/?apikey=thewdb&s='+searchName, function(error, response, body){
		if(!error && response.statusCode == 200){
			let parseId = JSON.parse(body)
			req.session.path = 'result?search='+searchName.split(" ").join("+");	
			res.render("result", {parseId: parseId, user:user, searchName:searchName});
		} else {
			console.log(error);
		}
	})
});

app.get('/title/:movie_title', function(req, res){
	let film = req.params.movie_title;
	let user = req.session.user;
	req.session.path = '/title/'+film;
	request('http://www.omdbapi.com/?apikey=thewdb&t='+film, function(error, response, body){
		if(!error && response.statusCode == 200){
			let parseId = JSON.parse(body);
			connection.query("SELECT * FROM reviews WHERE movie_title=?", film, function(error, result){
				if(!error){
					let reviews = result;
					res.render('title', {parseId:parseId, reviews:reviews, user:user});
				} else{
					console.log(error);
				}
			})
			
		} else {
			console.log(error);
			console.log(response.statusCode);
		}
	});

});

/********************
	comments section
*********************/
app.get('/title/:movie_title/comments/new', restrict, function(req, res){
	let user = req.session.user;
	let film = req.params.movie_title;
		connection.query('SELECT user, movie_title FROM reviews WHERE user=? AND movie_title=?', [user, film], function(error, result){
			if(result.length > 0 && result[0].user && result[0].movie_title){
				res.redirect('/title/'+film);
			} else{
				res.render('reviews/new', {film:film, user:user});
			}
		});
});


app.post('/title/:movie_title/comments', restrict, function(req, res){
	let movie = req.params.movie_title;
	let review = {user:req.session.user, review:req.body.review, movie_title:movie}
	connection.query("INSERT INTO reviews SET ?", review, function(error, result){
		if(error){
			console.log("comments post route SQL error "+error);
		}
	});
		res.redirect('/title/'+movie);
});

/***********************
	edit routes
************************/
app.get('/title/:movie/edit/:user', restrict, function(req, res){
	let film = req.params.movie
	let user = req.params.user;
		connection.query('SELECT * FROM reviews WHERE user=?', [user, film], function(error, result){
			if(error){
				console.log("undate review route "+error);
			} else{
					let existingReview = result[0].review
					res.render('reviews/edit', {film:film, user, user, existingReview:existingReview});
			}
		})
});

app.put('/title/:movie/:user', restrict, function(req, res){
	let film = req.params.movie;
	let user = req.params.user;
		connection.query('SELECT * FROM reviews WHERE user=?', user, function(err, result){
			if(err){
				console.log(err);
				res.redirect('/title/'+film);
			} else{
				connection.query("UPDATE reviews SET review=? WHERE user=?", [req.body.editReview, user], function(error, updateResult){
					if(error){
						console.log(error)
					} else{
							res.redirect('/title/'+film);
					}
				})
			}
		});
});

/*********************
	signup get and post
**********************/
app.get('/sign_up', loginSignupPageRestrict, function(req, res){
	res.render('auth/sign_up');
});

app.post('/sign_up', loginSignupPageRestrict, function(req, res){

	connection.query('SELECT username FROM users WHERE username=?', req.body.username, function(error, result){
		if(result.length > 0 && result[0].username === req.body.username){
			console.log("Mama a person with this username already exists mama");
			res.redirect("/sign_up");
			return;
		} 
		else{
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
	});
});

/*************************
		Login get and set
**************************/
app.get('/login', loginSignupPageRestrict, function(req, res){
	res.render("auth/login");
})

app.post('/login', loginSignupPageRestrict, function(req, res){
	connection.query("SELECT * FROM users WHERE username=?", req.body.username, function(error, result){
		if(error){
			console.log("login sql error "+error);
		} else{
			if(bcrypt.compare(req.body.password, result[0].user_password)){
				req.session.user = req.body.username;
				res.redirect(req.session.path);
			}
		}
	})
});

/**************
		logout
***************/
app.get('/logout', function(req, res, next){
	let lastVisit = req.session.path;
	req.session.destroy(function(error){
		if(error){
			console.log(error);
		} else{
			res.redirect(lastVisit);
		}
	})
})

/********************
	Delete route
*********************/
app.delete('/:movie/delete', function(req, res){
	let film = req.params.movie;
	connection.query("SELECT user FROM reviews where movie_title=?", film, function(error, result){
			for(let i=0; i<result.length; i++){
				if(result[i].user === req.session.user){
					let user = req.session.user
					connection.query("DELETE FROM reviews WHERE user=?", user, function(err, res){
						if(err){
							console.log("Review Delet error "+err);
						}
					})
				}
			}
			res.redirect('/title/'+film);
	});
});

app.listen(3000, function(){
	console.log("M ready");
});

/*****************
access restriction
******************/
function restrict(req, res, next){
	if(req.session.user){
		next();
	} else{
		res.redirect('/login');
	}
}

function loginSignupPageRestrict(req, res, next){
	if(!req.session.user){
		next();
	} else{
		res.redirect('/')
	}
}
