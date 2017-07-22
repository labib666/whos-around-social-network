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

	    			// find own status and use it here

		    		res.render('userProfile', {
		    			'title': user.username,
		    			'username': user.username
		    		});
		    	}

		    	// friend profile
		    	else if (user.friends != null && user.friends.indexOf(otherUser._id) != -1) {
		    		res.render('friendProfile', {
		    			'title': otherUser.username,
		    			'username': otherUser.username
		    		});
		    	}

		    	// public profile
		    	else {
					res.render('publicProfile', {
						'title': otherUser.username,
						'username': otherUser.username
					});
				}

			}
			else {
				res.status(404)
					.send("Page Not Found");
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
