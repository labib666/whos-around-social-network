var express = require('express');
var router = express.Router();
var bodyParser= require('body-parser');
var randomstring = require("randomstring");
var mongoose = require('mongoose');
var User = require('../models/User');
var Verify = require('../models/Verify');
var Auth = require('../middlewares/Authenticate');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));
router.use(Auth.getLoggedInUser);

router.use(function(req, res, next){
	if (req.user) {
		res.redirect('/');
	}
	else {
		next();
	}
});

router.get('/:api_token', function(req, res, next) {
	var api_token = req.params.api_token;
	Verify.findOne( {'api_token': api_token}, function(err, user) {
		if (err) return next(err);
		if (user == null) {
			res.cookie('verification', "FAILED");
			res.redirect('/signup');
		}
		else {
			User.findOne( { 'username': user.username }, function(errFu, uUser)  {
				if (errFu) return next(errFu);
				//console.log("username is in use: " + (uUser!=null));
				if (uUser == null) {
					// unique username. check for unique email now
					User.findOne(  { 'email': user.email }, function (errFe, eUser) {
						if (errFe) return next(errFe);
						//console.log("email is in use: " + (eUser!=null));
						if (eUser == null) {
						// unique email.
							var newUser = new User({
								'_id': new mongoose.Types.ObjectId(),
								'username': user.username,
								'email': user.email,
								'password': user.password,
								'api_token': randomstring.generate(50),
								'friends': [],
								'followers': [],
								'location': user.location
							});
							newUser.save(function(errSave){
								if (errSave) return next(errSave);
								res.cookie('verification', "SUCCESSFUL");
								res.redirect('/login');
							});
						}
						else {
							// set cookie to tell signup about duplicate email
							res.cookie('emailError', "DUPLICATE_DATA");
							res.cookie('userValue', user.username);
							res.cookie('emailValue', user.email);
							res.redirect('/signup');
						}
					});
				}
				else {
					// set cookie to tell signup about duplicate username
					res.cookie('userError', "DUPLICATE_DATA");
					res.cookie('userValue', user.username);
					res.cookie('emailValue', user.email);
					res.redirect('/signup');
				}
			});
		}
	});
});

module.exports = router;
