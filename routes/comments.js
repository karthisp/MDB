const express = require('express');
const comments = require('../models/comments');
const access = require('../restrictions');

const app = express();

//new
app.get('/title/:movie_title/comments/new', access.restrict, function(req, res){
	let user = req.session.user;
	let film = req.params.movie_title;
		comments.checkUserReview([user, film], function(error, result){
			if(result.length > 0 && result[0].user && result[0].movie_title){
				res.redirect('/title/'+film);
			} else{
				res.render('reviews/new', {film:film, user:user});
			}
		});
});

app.post('/title/:movie_title/comments', access.restrict, function(req, res){
	let movie = req.params.movie_title;
	let review = {user:req.session.user, review:req.body.review, movie_title:movie}
	comments.insertComment(review, function(error, result){
		if(error){
			console.log("comments post route SQL error "+error);
		}
	});
		res.redirect('/title/'+movie);
});


//update
app.get('/title/:movie/edit/:user', access.restrict, function(req, res){
	let film = req.params.movie
	let user = req.params.user;
		comments.checkUserReview([user, film], function(error, result){
			if(error){
				console.log("undate review route "+error);
			} else{
					let existingReview = result[0].review
					res.render('reviews/edit', {film:film, user, user, existingReview:existingReview});
			}
		})
});

app.put('/title/:movie/:user', access.restrict, function(req, res){
	let film = req.params.movie;
	let user = req.params.user;
		comments.updateReview([req.body.editReview, user, film], function(error, updateResult){
			if(error){
				console.log(error)
			} else{
					res.redirect('/title/'+film);
			}
		})
});

//delete
app.delete('/:movie/delete', function(req, res){
	let film = req.params.movie;
	let user = req.session.user
	comments.deleteReview([user, film], function(error, result){
		if(error){
			console.log(error);
			res.redirect('/title/'+film);
		}
		res.redirect('/title/'+film);
	})

});

module.exports = app;