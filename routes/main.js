const omdbApi = require('../api');
const express = require('express');
const request = require('request');
const comments = require('../models/comments');

const app = express();

app.get('/', function(req, res){
	let user = req.session.user;
	req.session.path = '/';
	res.render("home",{user:user});
});

app.get('/result/', function(req, res){
	let searchName =  req.query.search;
	let user = req.session.user;
	request(omdbApi.search()+searchName, function(error, response, body){
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
	request(omdbApi.title()+film, function(error, response, body){
		if(!error && response.statusCode == 200){
			let parseId = JSON.parse(body);
			comments.getReviews(film, function(error, result){
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

module.exports = app;