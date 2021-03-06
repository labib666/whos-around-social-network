var express = require('express');
var router = express.Router();
var bodyParser= require('body-parser');
var cookieParser = require('cookie-parser');
var htmlspecialchars = require('htmlspecialchars');
var updateLocInDB = require('../extra_modules/updateLocationInDB');
var bcrypt = require('bcrypt');
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
		var userValue = (req.cookies.userValue) ? req.cookies.userValue : null;
		var verification = (req.cookies.verification) ? req.cookies.verification : null;
		res.clearCookie('incorrectPass');
		res.clearCookie('incorrectUser');
		res.clearCookie('userValue');
		res.clearCookie('verification');
		var locals = {
			'title': "Log In",
			'incorrectUser': incorrectUser,
			'incorrectPass': incorrectPass,
			'userValue':  htmlspecialchars(userValue),
			'verification': verification,
			'csrfToken' : req.csrfToken()
		};
		//console.log(locals);
		res.render('pages/login', locals);
	}
})

router.post('/', function(req, res, next) {
	console.log("received credentials for login");

	if (req.user) {
		//console.log("user already logged in. redirecting to dashboard");
		res.redirect('/');
	}
	else {
		console.log(req.body);

		var username = req.body.username.toLowerCase();
		var password = req.body.password;
		var remember = req.body.remember;
		var coords = {
			'lat': req.body.lat,
			'long': req.body.long
		}

		if (username == "" || password == "") {
			//console.log("invalid entry in one of the fields");
			res.redirect('/login');
		}

		User.findOne( {$or:[ {'username': username}, {'email': username} ]}, function(errF, user) {
			if (errF) return next(errF);

			if (user == null) {
				//console.log("User does not exist.");

				// set cookie to inform incorrect username
				res.cookie('incorrectUser', true);
				res.cookie('userValue', username);
				res.redirect('/login');
			}
			else {
				bcrypt.compare(password, user.password, function(errM,match){
					if (errM) return next(errM);
					if (match == false) {
						//console.log("invalid password");
						//console.log("Found: " + password);

						// ser cookie to inform incorrect password
						res.cookie('incorrectPass', true);
						res.cookie('userValue', username);
						res.redirect('/login');
					}
					else {
						//console.log("successful login");

						var api_token = randomstring.generate(50);
						user.api_token = api_token;

						var ip = req.headers['x-forwarded-for'] ||
									req.connection.remoteAddress ||
									req.socket.remoteAddress ||
									req.connection.socket.remoteAddress;

						updateLocInDB(user,coords,ip,function(err,savedUser){
							if (err) return next(err);
							if(remember) {
								res.cookie('api_token', api_token, {maxAge: 31536000000, httpOnly: true});
							} else {
								res.cookie('api_token', api_token, {httpOnly: true});
							}
							res.redirect('/');
						});
					}
				});
			}
		});
	}
});

module.exports = router;
