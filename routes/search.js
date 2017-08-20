var express = require('express');
var router = express.Router();
var bodyParser= require('body-parser');
var natural = require('natural');
var htmlspecialchars = require('htmlspecialchars');
var mongoose = require('mongoose');
var User = require('../models/User');
var Auth = require('../middlewares/Authenticate');
var gravatarURL = require('../extra_modules/gravatar');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));
router.use(Auth.getLoggedInUser);

router.get('/', function(req, res, next) {
	var searched = req.query.data.toLowerCase();
	//console.log(req.query);
	console.log("serached: " + searched);

	if (req.user) {
		if (req.query.data.length <= 0) {
			var locals = {
				'title': "Search Results",
				'username': req.user.username,
				'searched': htmlspecialchars(searched)
			};
			locals.resultList = [];
			res.render('pages/search', locals);
		}
		else {
			generateResults(searched, function(err,locals) {
				if (err) return next(err);
				locals.username = req.user.username;
				//console.log(locals);
				res.render('pages/search', locals);
			});
		}
	}
	else {
		res.redirect('/login');
	}
});

var generateResults = function(searched,callback) {
	var locals = {
		'title': "Search Results",
		'searched': htmlspecialchars(searched)
	};
	locals.resultList = [];
	var userlist = [];
	var regString = '\S*'+searched+'\S*';
	var regex = new RegExp(regString);
	User.find().stream()
		.on('data', function(user) {
			if (validator(user.username,searched,regex)) {
				var result = {
					'username': user.username,
					'profilePictureURL': gravatarURL(user,75),
					'distance': natural.LevenshteinDistance(user.username,searched),
					'phoneticMatch': regex.test(user.username)
				};
				//console.log(result);
				locals.resultList.push(result);
				userlist.push(user.username);
			}
		})
		.on('error', function(err) {
			return callback(err,null);
		})
		.on('end', function() {
			User.find({'email':searched}).stream()
				.on('data', function(user) {
					var result = {
						'username': user.username,
						'profilePictureURL': gravatarURL(user,75),
						'distance': 0,
						'phoneticMatch': true
					};
					//console.log(result);
					if (userlist.indexOf(user.username) == -1) {
						locals.resultList.push(result);
						userlist.push(user.username);
					}
				})
				.on('error', function(err) {
					return callback(err,null);
				})
				.on('end', function() {
					locals.resultList.sort(function(a,b){
						if (a.phoneticMatch == b.phoneticMatch) {
							if (a.distance == b.distance) return 0;
							else if (a.distance < b.distance) return -1;
							else return 1;
						}
						else {
							if (a.phoneticMatch == true) return -1;
							else return 1;
						}
					});
					callback(null,locals);
				});
		});
}

var validator = function(username, searched, regex) {
	//console.log(username,searched,regex);
	var MAX_EDIT_DISTANCE = 2;
	var MIN_DIST_TO_ALLOW_REGEX = 3;
	var match = false;
	if (natural.LevenshteinDistance(username,searched) <= MAX_EDIT_DISTANCE) {
		//console.log("true -> levenshtein");
		match = true;
	}
	if (searched.length >= MIN_DIST_TO_ALLOW_REGEX && regex.test(username)) {
		//console.log("true -> regex");
		match = true;
	}
	return match;
}

module.exports = router;
