var express = require('express');
var router = express.Router();
var app = express();
var mongoose = require('mongoose');
var auth = require('../middlewares/authenticate');


router.get('/', function(req, res, next) {
	auth.getLoggedInUser(req, function(err, email){
		if(err) console.error(err);

		if (email) {
			var users = mongoose.model('users');

			users.findOne( {'api_token': req.cookies.api_token}, function(errF, user) {
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
			var users = mongoose.model('users');

			users.findOne( {'api_token': req.cookies.api_token}, function(errF, user) {
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
		    		res.render('user', { 
		    			'title': req.params.username,
		    			'username': req.params.username
		    		});
		    	}

	    	});
			
		}
		else {
	    	res.redirect('/login');
	    }
	    
    });
});

module.exports = router;
