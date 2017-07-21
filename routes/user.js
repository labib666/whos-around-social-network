var express = require('express');
var router = express.Router();
var app = express();
var bodyParser= require('body-parser');
var mongoose = require('mongoose');
var auth = require('../middlewares/authenticate');

app.use(bodyParser.urlencoded({extended: true}));

var User = require('../models/User');
var Status = require('../models/Status');

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
		    		
	    		// own profile
	    		if (user.username == req.params.username) {

	    			// find own status and use it here

		    		res.render('user', { 
		    			'title': user.username,
		    			'username': user.username
		    		});
		    	}

		    	// put in friend profile




		    	// put in public profile

		    	else {
		    		User.findOne( {'username': req.params.username}, function(errF2, reqUser) {
		    			if (errF2) console.error(errF2);
				    	if (reqUser) {
				    		res.render('user', { 
				    			'title': reqUser.username,
				    			'username': reqUser.username
				    		});
				    	}
				    	else {
				    		res.redirect('/dashboard');
				    	}
			    	});
		    	}

	    	});
			
		}
		else {
	    	res.redirect('/login');
	    }
	    
    });
});

router.post('/postUpdate', function(req, res, next) {
	var status = req.body.status;
	auth.getLoggedInUser(req, function(err, email){
		if(err) console.error(err);

		if(email) {
			res.redirect('/dashboard');
			User.findOne( {'api_token': req.cookies.api_token}, function(errF, user) {
				if (errF) console.error(errF);
				var userId = user._id;
			});
		}
		else {
			res.redirect('/login');
		}
	});
});


module.exports = router;
