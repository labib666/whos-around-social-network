var express = require('express');
var router = express.Router();
var app = express();
var bodyParser= require('body-parser');
var randomstring = require("randomstring");
var mongoose = require('mongoose');
var User = require('../models/User');
var Auth = require('../middlewares/Authenticate');

app.use(bodyParser.urlencoded({extended: true}));
router.use(Auth.getLoggedInUser);

router.get('/', function(req, res, next) {
    if (req.user) {
        res.redirect('/dashboard');
    }
    else {
        res.render('signup', { 'title': "Sign Up" });
    }
})


router.post('/', function(req, res, next) {
	console.log("request received to signup new user");

	if (req.user) {
		console.log("user already logged in. redirecting to dashboard");
		res.redirect('/dashboard');
	}
	else {
		console.log(req.body);

		var username = req.body.username;
		var email = req.body.email;
		var password = req.body.password;

		// entry validity check here. have to implement use of middleware later
		if (username == "" || email == "" || password == "") {
			console.log("invalid entry in one of the fields");
			res.redirect('/signup');
		}
		else {
		  	User.findOne(  { 'email': email }, function (errF, user) {
				if (errF) console.error(errF);

				console.log("email is in use: " + (user!=null));

				if (user == null) { // unique email
					var newUser = new User({
						'_id': new mongoose.Types.ObjectId(),
						'username': username,
						'email': email,
						'password': password,
						'api_token': randomstring.generate(50)
					});

					newUser.save(function (saveErr, savedUser) {
						if (saveErr) console.error(saveErr);
						console.log("saved new user: " + JSON.stringify(savedUser));
						console.log("signup successful. redirecting to login");
						res.redirect('/login');
					});
				}
				else {
					console.log("redirecting to signup");
					res.redirect('/signup');
				}
		  	});
	  	}
	}
});

module.exports = router;
