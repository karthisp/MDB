const connection = require('../db.js');

const comments = {

	getReviews:function(film, callback){
		return connection.query('SELECT * FROM reviews WHERE movie_title=?', film, callback);
	},
	checkUserReview:function(userTitle, callback){
		return connection.query('SELECT * FROM reviews WHERE user=? AND movie_title=?', userTitle, callback)
	},
	insertComment:function(newReview, callback){
		return connection.query('INSERT INTO reviews SET ?', newReview, callback)
	},
	updateReview:function(updatedReview, callback){
		return connection.query('UPDATE reviews SET review=? WHERE user=? AND movie_title=?', updatedReview, callback);
	},
	deleteReview:function(delReview, callback){
		return connection.query('DELETE FROM reviews WHERE user=? AND movie_title=?', delReview, callback);
	}
}

module.exports = comments;