const connection = require('../db.js');

const user = {
	searcgByUser:function(user, callback){
		return connection.query('SELECT * FROM users WHERE username=?', user, callback)
	},
	addNewUser:function(newUser, callback){
		return connection.query('INSERT INTO users SET ?', newUser, callback)
	}
}

module.exports = user;