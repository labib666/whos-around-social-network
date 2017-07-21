var express = require('express');
var router = express.Router();
var app = express();
var bodyParser= require('body-parser');
var randomstring = require("randomstring");
var mongoose = require('mongoose');
var User = require('../models/User');
var auth = require('../middlewares/authenticate');

app.use(bodyParser.urlencoded({extended: true}));


router.get('/', function(req, res, next) {
	console.log("here to login");
	auth.getLoggedInUser(req, function(err, email){
		if(err) console.error(err);

		if (email) {
			res.redirect('/dashboard');
		}
		else {
			res.render('login', { title: 'Log in' });
		}
	});
	
})

router.post('/', function(req, res, next) {
 	console.log("login credential received");
  	auth.getLoggedInUser(req, function(err, Email){
  		if (err) console.error(err);

		if (Email) {
			res.redirect('/dashboard');
		}
		else {

			console.log(req.body);

			var email = req.body.email;
			var password = req.body.password;
			if (email == "" || password == "") res.redirect('/login');


		    User.count( { "email": email }, function(countError, count) {
		  	    if (countError) console.error(countError); 
		  	    console.log("count = " + count);

			    if (count === 0) {
			  	    console.log("invalid email");
			  	    res.redirect('/login');
			    }

			    else {
				    User.findOne({ "email": email }, function(findError, user){
					    if (findError) console.error(findError); 
					    console.log( "user = " + user );

					    if (user.password !== password) {
					  		console.log("invalid password " + user.password, password);
				  			res.redirect('/login');
					  	}
					  	else {
					  		console.log("successful signin");

					  		var api_token = randomstring.generate(50);

						  	user.api_token = api_token;
						  	console.log(user);
						  	console.log(api_token);

					  		User.update( { 'email': email }, { $set:{'api_token': api_token} },
					  	 		function(saveErr, saveVal) {
					  				if (saveErr) console.error(saveErr);
					  				console.log( saveVal );

					  				/// set cookie here
						  			res.cookie('api_token', api_token);

						  			res.redirect('/dashboard');
					  			}
					  		);	
					    }
				    });
				}
			  
		    });
		}
	});

});

module.exports = router;