var express = require('express');
var router = express.Router();
var bodyParser= require('body-parser');
var cookieParser = require('cookie-parser');
var htmlspecialchars = require('htmlspecialchars');
var bcrypt = require('bcrypt');
var randomstring = require("randomstring");
var mongoose = require('mongoose');
var Verify = require('../models/Verify');
var Auth = require('../middlewares/Authenticate');

router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));
router.use(Auth.getLoggedInUser);

router.get('/', function(req, res, next) {
	var userValue = (req.cookies.userValue) ? req.cookies.userValue : null;
	var emailValue = (req.cookies.emailValue) ? req.cookies.emailValue : null;
	res.clearCookie('userValue');
	res.clearCookie('emailValue');
	res.render('pages/dbtest', {
		'title': "dbtest",
		'userValue': htmlspecialchars(userValue),
		'emailValue': htmlspecialchars(emailValue)
	});
})


router.post('/', function(req, res, next) {
	console.log("request received to signup new user");
	console.log(req.body);

	var username = req.body.username.toLowerCase();
	var email = req.body.email.toLowerCase();
	var password = req.body.password;

	// entry validity check here. have to implement use of middleware later
	if (username == "" || email == "" || password == "") {
		//console.log("invalid entry in one of the fields");
		res.cookie('userValue', username);
		res.cookie('emailValue', email);
		res.redirect('/dbtest');
	}
	else {
		var rounds = parseInt(process.env.BCRYPT_SALT_ROUNDS);
		bcrypt.genSalt(rounds,function(errS, salt){
			if (errS) return next(errS);
			bcrypt.hash(password,salt,function(errH,hash){
				if (errH) return next(errH);
				var newUser = new Verify({
					'_id': new mongoose.Types.ObjectId(),
					'username': username,
					'email': email,
					'password': hash,
					'api_token': randomstring.generate(50)
				});
				console.log("saving new user: ", newUser);
				newUser.save(function(errSave,savedUser){
					// console.log(savedUser.createdAt.toString());
					
					res.cookie('userValue', username);
					res.cookie('emailValue', email);
					res.redirect('/dbtest');
				});
			});
		});
	}
});


module.exports = router;
