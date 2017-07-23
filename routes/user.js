var express = require('express');
var router = express.Router();
var app = express();
var bodyParser= require('body-parser');
var mongoose = require('mongoose');
var User = require('../models/User');
var Status = require('../models/Status');
var Auth = require('../middlewares/Authenticate');

app.use(bodyParser.urlencoded({extended: true}));
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
			if (errF) console.error(errF);
			if (otherUser) {

				// own profile
				if (user.username == otherUser.username) {
					ownProfileLocals(user, function(err,locals) {
						if (err) console.error(err);
						console.log(locals);
						res.render('pages/userProfile',locals);
					});
				}

				// friend profile
				else if (user.friends != null && user.friends.indexOf(otherUser._id) != -1) {
					friendProfileLocals(otherUser, function(err,locals) {
						if (err) console.error(err);
						res.render('pages/friendProfile',locals);
					});
				}

				// public profile
				else {
					publicProfileLocals(otherUser, function(err,locals) {
						if (err) console.error(err);
						res.render('pages/publicProfile',locals);
					});
				}

			}
			else {
				res.status(404)
					.send("404: Page Not Found");
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
			if (saveErr) console.error(saveErr);
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
		'username': user.username
	}
	// find own status and use it here
	res.statusList = "";
	Status.find({'userId': user._id}).stream()
		.on('data', function(doc){
			console.log(res.statusList);
			var date = doc.timeCreated;
			var status = doc.status;
			res.statusList = res.statusList + date + "<br>";
			res.statusList = res.statusList + status + "<br>";
		})
		.on('error', function(err){
			console.error(err);
		})
		.on('end', function(){
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
	res.statusList = "";
	// find friend's status and use it here
	Status.find({'userId': user._id}).stream()
		.on('data', function(doc){
			console.log(res.statusList);
			var date = doc.timeCreated;
			var status = doc.status;
			res.statusList = res.statusList + date + "<br>";
			res.statusList = res.statusList + status + "<br>";
		})
		.on('error', function(err){
			console.error(err);
		})
		.on('end', function(){
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
	callback(err,res);
}

module.exports = router;
