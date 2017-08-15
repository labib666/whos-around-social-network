var express = require('express');
var router = express.Router();
var bodyParser= require('body-parser');
var natural = require('natural');
var mongoose = require('mongoose');
var User = require('../models/User');
var Auth = require('../middlewares/Authenticate');
var gravatarURL = require('../extra_modules/gravatar');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));
router.use(Auth.getLoggedInUser);

router.get('/', function(req, res, next) {
	//console.log(req.query);
	if (req.user) {
		if (req.query.data.length <= 0) {
			var locals = {
				'title': "Search Results",
				'username': req.user.username,
				'searched': searched
			};
			locals.resultList = [];
			res.render('pages/search', locals);
		}
		else {
			generateResults(req.query.data.toLowerCase(), function(err,locals) {
				if (err) return next(err);
				locals.username = req.user.username,
				res.render('pages/search', locals);
			});
		}
	}
	else {
		res.redirect('/login');
	}
});

var generateResults = function(searched,callback) {
	var MAX_EDIT_DISTANCE = 2;
	var MAX_PHONETICS_LENGTH = 3;
	var locals = {
		'title': "Search Results",
		'searched': searched
	};
	locals.resultList = [];
	var userlist = [];
	var suf1 = searched.substr(0,Math.min(MAX_PHONETICS_LENGTH,searched.length));
	User.find().stream()
		.on('data', function(user) {
			var suf2 = user.username.substr(0,Math.min(MAX_PHONETICS_LENGTH,user.username.length));
			if (validator(user.username,searched, MAX_EDIT_DISTANCE, MAX_PHONETICS_LENGTH)) {
				var result = {
					'username': user.username,
					'profilePictureURL': gravatarURL(user,75),
					'distance': natural.LevenshteinDistance(user.username,searched),
					'phoneticMatch': natural.Metaphone.compare(suf1,suf2)
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

var validator = function(str1, str2, MED, MPL) {
	var match = false;
	if (natural.LevenshteinDistance(str1,str2) <= MED) {
		match = true;
	}
	var suf1 = str1.substr(0,Math.min(MPL,str1.length));
	var suf2 = str2.substr(0,Math.min(MPL,str2.length));
	if (natural.Metaphone.compare(suf1,suf2)) {
		match = true;
	}
	return match;
}

module.exports = router;
