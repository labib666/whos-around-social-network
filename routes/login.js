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
		res.render('login', { 'title': "Log in" });
	}
})

router.post('/', function(req, res, next) {
	console.log("received credentials for login");

	if (req.user) {
		console.log("user already logged in. redirecting to dashboard");
		res.redirect('/dashboard');
	}
	else {
		console.log(req.body);

		var email = req.body.email;
		var password = req.body.password;

		if (email == "" || password == "") {
			console.log("invalid entry in one of the fields");
			res.redirect('/login');
		}

		User.findOne( { 'email': email }, function(errF, user) {
			if (errF) console.error(errF);

			if (user == null) {
				console.log("User does not exist.");
				res.redirect('/login');
			}
			else {
				console.log( "user = " + JSON.stringify(user) );

				if (user.password != password) {
					console.log("invalid password");
					console.log("Expected: " + user.password);
					console.log("Found: " + password);
					res.redirect('/login');
				}
				else {
					console.log("successful login");

					var api_token = randomstring.generate(50);

					user.api_token = api_token;
					console.log(user);
					console.log(api_token);

					User.update( { '_id': user._id }, { $set: {'api_token': api_token} },
						function(saveErr, saveStat) {
						if (saveErr) console.error(saveErr);
							console.log( saveStat );

							/// set cookie here
							res.cookie('api_token', api_token);

							res.redirect('/dashboard');
						}
					);
				}
			}
		});
	}
});

module.exports = router;
