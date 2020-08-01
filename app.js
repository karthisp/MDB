const express = require("express");
const user = require('./routes/user');
const main = require('./routes/main');
const bodyParser = require("body-parser");
const session = require('express-session');
const comments = require('./routes/comments');
const methodOverride = require("method-override");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
	secret:"keep_calm",
	resave: false,
	 saveUninitialized: true
}));


app.use(methodOverride('_method'));

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.use(main);
app.use(comments);
app.use(user);


app.listen(process.env.PORT||3000, function(){
	console.log("M ready");
});