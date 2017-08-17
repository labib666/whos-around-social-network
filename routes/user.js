var express = require('express');
var router = express.Router();
var bodyParser= require('body-parser');
var mongoose = require('mongoose');
var User = require('../models/User');
var Status = require('../models/Status');
var Auth = require('../middlewares/Authenticate');
var gravatarURL = require('../extra_modules/gravatar');
var makeStatusList = require('../extra_modules/listStatus');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));
router.use(Auth.getLoggedInUser);
router.use(function(req, res, next){
	if (req.user) {
		next();
	}
	else {
		res.redirect('/login');
	}
});

// viewing user profile

router.get('/', function(req, res, next) {
	res.redirect('/user/'+req.user.username);
});

router.get('/:username', function(req, res, next) {
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
				friendProfileLocals(otherUser, user, function(err,locals) {
					if (err) return next(err);
					//console.log(locals);
					res.render('pages/friendProfile',locals);
				});
			}

			// public profile
			else {
				publicProfileLocals(otherUser, user, function(err,locals) {
					if (err) return next(err);
					//console.log(locals);
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
});

// get locals from these functions when rendering a profile view

// render user view
var ownProfileLocals = function (user, callback) {
	var res = {
		'title': user.username,
		'username': user.username,
		'email': user.email,
		'peopleFollowing': user.friends.length,
		'profilePictureURL': gravatarURL(user,150)
	};
	// find own status and use it here
	makeStatusList([user._id], 25000000, function(err,statusList) {
		if (err) return callback(err,null);
		res.statusList = statusList;
		callback(null,res);
	});
}

// render friends view
var friendProfileLocals = function (friend, user, callback) {
	var res = {
		'title': friend.username,
		'profilename': friend.username,
		'username': user.username,
		'profilePictureURL': gravatarURL(friend,150)
	}
	// find friend's status and use it here
	makeStatusList([friend._id], 25000000, function(err,statusList) {
		if (err) return callback(err,null);
		res.statusList = statusList;
		callback(null,res);
	});
}

// render public view
var publicProfileLocals = function (otheruser, user, callback) {
	var res = {
		'title': otheruser.username,
		'profilename': otheruser.username,
		'username': user.username,
		'profilePictureURL': gravatarURL(otheruser,150)
	}
	callback(null,res);
}


// how do we post a status?

router.post('/postUpdate', function(req, res, next) {
	var status = new Status({
		'_id': new mongoose.Types.ObjectId(),
		'userId': req.user._id,
		'status': req.body.status,
		'timeCreated': Date.now(),
		'location': req.user.location
	});
	status.save(function (saveErr, savedStatus) {
		if (saveErr) return next(saveErr);
		console.log("saved status to database");
		console.log(status);
		res.redirect('back');
	});
});

// update user location every 5 minutes

router.post('/updateLocation', function(req, res, next) {
	console.log(req.body);
	// update user location
	req.user.location.longitude = (req.body.geoCoordinates.longitude)
									? req.body.geoCoordinates.longitude
										: req.body.ipCoordinates.longitude;
	req.user.location.latitude = (req.body.geoCoordinates.latitude)
									? req.body.geoCoordinates.latitude
										: req.body.ipCoordinates.latitude;
	req.user.save(function (saveErr, savedStatus) {
		if (saveErr) return next(saveErr);
		console.log("updated location in database");
		res.json(req.body);
	});
});

module.exports = router;
