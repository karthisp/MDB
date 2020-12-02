const mysql = require("mysql"); 

const connection = mysql.createConnection({
	host : "localhost",
	user : "Nobody",
	password : "anything",
	database : "Movies_DB"
});

connection.connect(function(error){
	if(error){
		console.log(error.stack);
	} else{
		console.log(`Connected to DB successfully`);
	}
});

module.exports = connection;