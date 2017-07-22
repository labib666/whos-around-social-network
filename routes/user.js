var express = require('express');
var router = express.Router();
var app = express();
var bodyParser= require('body-parser');
var mongoose = require('mongoose');
var User = require('../models/User');
var Status = require('../models/Status');
var Auth = require('../middlewares/Authenticate');
var Locals = require('../middlewares/LocalsMaker');

app.use(bodyParser.urlencoded({extended: true}));
router.use(Auth.getLoggedInUser);

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
					Locals.ownProfile(user, function(err,locals) {
						if (err) console.error(err);
						console.log(locals);
						res.render('userProfile',locals);
					});
				}

				// friend profile
				else if (user.friends != null && user.friends.indexOf(otherUser._id) != -1) {
					Locals.friendProfile(otherUser, function(err,locals) {
						if (err) console.error(err);
						res.render('friendProfile',locals);
					});
				}

				// public profile
				else {
					Locals.publicProfile(otherUser, function(err,locals) {
						if (err) console.error(err);
						res.render('friendProfile',locals);
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


module.exports = router;
