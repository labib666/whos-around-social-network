var express = require('express');
var router = express.Router();
var app = express();
var bodyParser= require('body-parser');
var mongoose = require('mongoose');
var User = require('../models/User');
var Status = require('../models/Status');
var auth = require('../middlewares/authenticate');

app.use(bodyParser.urlencoded({extended: true}));


router.get('/', function(req, res, next) {
	auth.getLoggedInUser(req, function(err, email){
		if(err) console.error(err);

		if (email) {

			User.findOne( {'api_token': req.cookies.api_token}, function(errF, user) {
				if (errF) console.error(errF);
				console.log('/user/'+user.username);
	    		res.redirect('/user/'+user.username);
	    	});
			
		}
		else {
	    	res.redirect('/login');
	    }
	    
    });
});

router.get('/:username', function(req, res, next) {
	
	auth.getLoggedInUser(req, function(err, email){
		
		if(err) console.error(err);

		if (email) {

			User.findOne( {'api_token': req.cookies.api_token}, function(errF, user) {

				if (errF) console.error(errF);
				
				User.findOne( {'username': req.params.username}, function(errF2, otherUser) {

					if (otherUser) {
						if (errF2) console.error(errF2);
			    		
			    		// own profile
			    		if (user.username == req.params.username) {

			    			// find own status and use it here

				    		res.render('userProfile', { 
				    			'title': user.username,
				    			'username': user.username
				    		});
				    	}

				    	// put in friend profile

				    	else if (user.friends != null && user.friends.indexOf(otherUser._id) != -1) {
				    		console.log('friends with ' + otherUser.username);
				    		res.render('friendProfile', { 
				    			'title': otherUser.username,
				    			'username': otherUser.username
				    		});
				    		
				    	}


				    	// put in public profile

				    	else {
				    		User.findOne( {'username': req.params.username}, function(errF2, reqUser) {
				    			if (errF2) console.error(errF2);
						    	if (reqUser) {
						    		res.render('publicProfile', { 
						    			'title': reqUser.username,
						    			'username': reqUser.username
						    		});
						    	}
						    	else {
						    		res.redirect('/user');
						    	}
					    	});
				    	}
					}
					else {
						res.redirect('/user');
					}
		    	});
		    });
		}
		else {
	    	res.redirect('/login');
	    }
    });
});

router.post('/postUpdate', function(req, res, next) {
	auth.getLoggedInUser(req, function(err, email){
		if(err) console.error(err);

		if(email) {
			//res.redirect('/dashboard');
			User.findOne( {'api_token': req.cookies.api_token}, function(errF, user) {
				if (errF) console.error(errF);
				var status = new Status({
					'userId': user._id,
					'status': req.body.status,
					'timeCreated': Date.now(),
					// fix location here
				});
				status.save(function(errS) {
					if (errS) console.error(errS);
					console.log("saved status to database");
					res.redirect('/user');
				});
			});
		}
		else {
			res.redirect('/login');
		}
	});
});


module.exports = router;
