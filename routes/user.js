var express = require('express');
var router = express.Router();
var bodyParser= require('body-parser');
var human = require('human-time');
var htmlspecialchars = require('htmlspecialchars');
var nl2br = require('nl2br');
var mongoose = require('mongoose');
var User = require('../models/User');
var Status = require('../models/Status');
var Auth = require('../middlewares/Authenticate');
var gravatarURL = require('../extra_modules/gravatar');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));
router.use(Auth.getLoggedInUser);

// viewing user profile

router.get('/', function(req, res, next) {
	if (req.user) {
		res.redirect('/user/'+req.user.username);
	}
	else {
		res.redirect('/login');
	}
});

router.get('/:username', function(req, res, next) {
	if (req.user) {
		var user = req.user;
		User.findOne( {'username': req.params.username}, function(errF, otherUser) {
			if (errF) return next(errF);
			if (otherUser) {

				// own profile
				if (user.username == otherUser.username) {
					ownProfileLocals(user, function(err,locals) {
						if (err) return next(err);
						console.log(locals);
						res.render('pages/userProfile',locals);
					});
				}

				// friend profile
				else if (user.friends != null && user.friends.indexOf(otherUser._id) != -1) {
					friendProfileLocals(otherUser, function(err,locals) {
						if (err) return next(err);
						console.log(locals);
						res.render('pages/friendProfile',locals);
					});
				}

				// public profile
				else {
					publicProfileLocals(otherUser, function(err,locals) {
						if (err) return next(err);
						console.log(locals);
						res.render('pages/publicProfile',locals);
					});
				}

			}
			else {
				var err = new Error("Page Not Found");
				err.status = 404;
				next(err);
			}
		});
	}
	else {
		res.redirect('/login');
	}
});

// how do we post a status?

router.post('/postUpdate', function(req, res, next) {
	if(req.user) {
		var status = new Status({
			'_id': new mongoose.Types.ObjectId(),
			'userId': req.user._id,
			'status': req.body.status,
			'timeCreated': Date.now()
			// fix location here
		});
		status.save(function (saveErr, savedStatus) {
			if (saveErr) return next(saveErr);
			console.log("saved status to database");
			res.redirect('/user');
		});
	}
	else {
		res.redirect('/login');
	}
});


// get locals from these functions when rendering a profile view

// render user view
var ownProfileLocals = function (user, callback) {
	var err = null;
	var res = {
		'title': user.username,
		'username': user.username,
		'email' : user.email
	};
	res.profilePictureURL = gravatarURL(user,150);
	res.profilePictureURLsmall = gravatarURL(user,75);
	// find own status and use it here
	res.statusList = [];
	Status.find({'userId': user._id}).stream()
		.on('data', function(doc){
			var statusData = {
				'date': human(-(doc.timeCreated-Date.now())/1000),
				'status': nl2br(htmlspecialchars(doc.status))
			}
			res.statusList.push(statusData);
		})
		.on('error', function(err){
			return next(err);
		})
		.on('end', function(){
			res.statusList.reverse();
			callback(err,res);
		});
}

// render friends view
var friendProfileLocals = function (user, callback) {
	var err = null;
	var res = {
		'title': user.username,
		'username': user.username
	}
	res.profilePictureURL = gravatarURL(user,150);
	res.profilePictureURLsmall = gravatarURL(user,75);
	// find friend's status and use it here
	res.statusList = [];
	Status.find({'userId': user._id}).stream()
		.on('data', function(doc){
			var statusData = {
				'date': human(-(doc.timeCreated-Date.now())/1000),
				'status': nl2br(htmlspecialchars(doc.status))
			}
			res.statusList.push(statusData);
		})
		.on('error', function(err){
			return next(err);
		})
		.on('end', function(){
			res.statusList.reverse();
			callback(err,res);
		});
}

// render public view
var publicProfileLocals = function (user, callback) {
	var err = null;
	var res = {
		'title': user.username,
		'username': user.username
	}
	res.profilePictureURL = gravatarURL(user,150);
	callback(err,res);
}

module.exports = router;
