var express = require('express');
var router = express.Router();
var cookieParser = require('cookie-parser');
var human = require('human-time');
var htmlspecialchars = require('htmlspecialchars');
var nl2br = require('nl2br');
var mongoose = require('mongoose');
var User = require('../models/User');
var Status = require('../models/Status');
var Auth = require('../middlewares/Authenticate');
var predicateBy = require('../extra_modules/predicate');
var gravatarURL = require('../extra_modules/gravatar');

router.use(cookieParser());
router.use(Auth.getLoggedInUser);

router.get('/', function(req, res, next) {
	if (req.user) {
		var user = req.user;
		dashboardLocals(user, function(err,locals) {
			if (err) return next(err);
			//console.log(locals);
			res.render('pages/dashboard', locals);
		});
	}
	else {
		res.redirect('/login');
	}
});

// render dashboard view
var dashboardLocals = function (user, callback) {
	var res = {
		'title': "Dashboard",
		'username': user.username
	}
	res.profilePictureURL = gravatarURL(user,150);

	// find friend's status and use it here
	var friendList = user.friends;
	friendList.push(user._id);
	res.statusList = [];

	var promises = [];
	Status.find( { 'userId': { $in: friendList } } ).stream()
		.on('data', function(doc){
			//console.log(doc);
			promises.push(new Promise(function(resolve,reject){
				var statusData = {
					'timeCreated' : doc.timeCreated,
					'date': human(-(doc.timeCreated-Date.now())/1000),
					'status': nl2br(htmlspecialchars(doc.status))
				}
				User.findOne({'_id': doc.userId}, function(errF, friend){
					if (errF) reject(errF);
					statusData.username = friend.username;
					statusData.profilePictureURL = gravatarURL(friend,75);
					res.statusList.push(statusData);
					resolve();
				});
			}));
		})
		.on('error', function(err){
			return next(err);
		})
		.on('end', function(){
			Promise.all(promises)
				.then(function(){
					res.statusList.sort(predicateBy('timeCreated'));
					callback(null,res);
				})
				.catch(function(err){
					return next(err);
				});
		});
}

module.exports = router;
