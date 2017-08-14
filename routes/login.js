var express = require('express');
var router = express.Router();
var bodyParser= require('body-parser');
var cookieParser = require('cookie-parser');
var randomstring = require("randomstring");
var mongoose = require('mongoose');
var User = require('../models/User');
var Auth = require('../middlewares/Authenticate');

router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));
router.use(Auth.getLoggedInUser);

router.get('/', function(req, res, next) {
	if (req.user) {
		res.redirect('/');
	}
	else {
		var incorrectPass = (req.cookies.incorrectPass) ? true : false;
		var incorrectUser = (req.cookies.incorrectUser) ? true : false;
		res.clearCookie('incorrectPass');
		res.clearCookie('incorrectUser');
		res.render('pages/login', {
			'title': "Log In",
			'incorrectUser': incorrectUser,
			'incorrectPass': incorrectPass,
			'csrfToken' : req.csrfToken()
		});
	}
})

router.post('/', function(req, res, next) {
	console.log("received credentials for login");

	if (req.user) {
		console.log("user already logged in. redirecting to dashboard");
		res.redirect('/');
	}
	else {
		console.log(req.body);

		var username = req.body.username.toLowerCase();
		var password = req.body.password;
		var remember = req.body.remember;

		if (username == "" || password == "") {
			console.log("invalid entry in one of the fields");
			res.redirect('/login');
		}

		User.findOne( { 'username': username }, function(errF, user) {
			if (errF) return next(errF);

			if (user == null) {
				console.log("User does not exist.");

				// set cookie to inform incorrect username
				res.cookie('incorrectUser', true);

				res.redirect('/login');
			}
			else {
				console.log( "user = " + JSON.stringify(user) );

				if (user.password != password) {
					console.log("invalid password");
					console.log("Expected: " + user.password);
					console.log("Found: " + password);

					// ser cookie to inform incorrect email
					res.cookie('incorrectPass', true);

					res.redirect('/login');
				}
				else {
					console.log("successful login");

					var api_token = randomstring.generate(50);

					user.api_token = api_token;

					User.update( { '_id': user._id }, { $set: {'api_token': api_token} },
						function(saveErr, saveStat) {
						if (saveErr) return next(saveErr);
							console.log( saveStat );

							if(remember) {
								res.cookie('api_token', api_token, {maxAge: 31536000000, httpOnly: true});
							} else {
								res.cookie('api_token', api_token, {httpOnly: true});
							}
							res.redirect('/');
						}
					);
				}
			}
		});
	}
});

module.exports = router;
