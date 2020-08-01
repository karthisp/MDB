const express = require('express');
const bcrypt = require('bcrypt');
const user = require('../models/user');
const access = require('../restrictions');

const app = express();

//signup
app.get('/sign_up', access.loginSignupPageRestrict, function(req, res){
	res.render('auth/sign_up');
});

app.post('/sign_up', access.loginSignupPageRestrict, function(req, res){
	user.searcgByUser(req.body.username, function(error, result){
		if(result.length > 0 && result[0].username === req.body.username){
			console.log("Mama a person with this username already exists mama");
			res.redirect("/sign_up");
			return;
		} 
		else{
			bcrypt.hash(req.body.password, 10, function(err, hash){
				let newUser = {username:req.body.username, user_email:req.body.email, user_password:hash}
				user.addNewUser(newUser, function(error, result){
					if(error){
						console.log("sql signup error "+sqlerror);
						return;
					}
					res.redirect('/login');
				})
			})
		}
	});
});

//log routes
app.get('/login', access.loginSignupPageRestrict, function(req, res){
	res.render("auth/login");
});

app.post('/login', access.loginSignupPageRestrict, function(req, res){
	user.searcgByUser(req.body.username, function(error, result){
		if(error){
			console.log("login sql error "+error);
			res.redirect('/')
		} else{
			if(bcrypt.compare(req.body.password, result[0].user_password)){
				req.session.user = req.body.username;
				res.redirect(req.session.path);
			}
		}
	})
});

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

module.exports = app;