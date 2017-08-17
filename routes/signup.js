var express = require('express');
var express = require('express');
var router = express.Router();
var bodyParser= require('body-parser');
var cookieParser = require('cookie-parser');
var randomstring = require("randomstring");
var mongoose = require('mongoose');
var User = require('../models/User');
var Auth = require('../middlewares/Authenticate');

router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));
router.use(Auth.getLoggedInUser);
router.use(function(req,res,next){
	if (req.user) {
		console.log("user already logged in. redirecting to dashboard");
		res.redirect('/');
	}
	else {
		next();
	}
});

router.get('/', function(req, res, next) {
	var emailError = (req.cookies.emailError) ? req.cookies.emailError : null;
	var userError = (req.cookies.userError) ? req.cookies.userError : null;
	var passwordError = (req.cookies.passwordError) ? req.cookies.passwordError : null;
	res.clearCookie('emailError');
	res.clearCookie('userError');
	res.clearCookie('passwordError');
	res.render('pages/signup', {
		'title': "Sign Up",
		'emailError': emailError,
		'userError': userError,
		'passwordError': passwordError,
		'csrfToken' : req.csrfToken()
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
		console.log("invalid entry in one of the fields");
		res.redirect('/signup');
	}
	else {

		User.findOne( { 'username': username }, function(errFu, uUser)  {
			if (errFu) return next(errFu);
			console.log("username is in use: " + (uUser!=null));
			if (uUser == null) {
				// unique username. check for unique email now
				User.findOne(  { 'email': email }, function (errFe, eUser) {
					if (errFe) return next(errFe);
					console.log("email is in use: " + (eUser!=null));
					if (eUser == null) {
						// unique email. match with regex now
						if (emailRegexCheck(email) == false) {
							res.cookie('emailError', "FORMAT_MISMATCH");
							res.redirect('/signup');
						}
						else if (userRegexCheck(username) == false) {
							res.cookie('userError', "FORMAT_MISMATCH");
							res.redirect('/signup');
						}
						else if (passwordRegexCheck(password) == false) {
							res.cookie('passwordError', "FORMAT_MISMATCH");
							res.redirect('/signup');
						}
						// everything is fine. nothing weird of fishy. save user now
						else {
							var newUser = new User({
								'_id': new mongoose.Types.ObjectId(),
								'username': username,
								'email': email,
								'password': password,
								'api_token': randomstring.generate(50)
							});
							newUser.save(function (saveErr, savedUser) {
								if (saveErr) return next(saveErr);
								console.log("saved new user: ", savedUser);
								console.log("signup successful. redirecting to login");
								res.redirect('/login');
							});
						}
					}
					else {
						console.log("redirecting to signup");
						// set cookie to tell signup about duplicate email
						res.cookie('emailError', "DUPLICATE_DATA");
						res.redirect('/signup');
					}
				});
			}
			else {
				console.log("redirecting to signup");
				// set cookie to tell signup about duplicate username
				res.cookie('userError', "DUPLICATE_DATA");
				res.redirect('/signup');
			}
		});
	}
});

var emailRegexCheck = function(email) {
	var re = new RegExp(/^[A-Za-z0-9._%+-]{2,}@[A-Za-z0-9-]+\.[a-zA-Z.]{2,}$/);
	console.log(re.test(email));
	return re.test(email);
}

var userRegexCheck = function(username) {
	var re = new RegExp(/^([a-z0-9]+(?:[._-][a-z0-9]+)*){4,20}$/);
	console.log(re.test(username));
	return re.test(username);
}

var passwordRegexCheck = function(password) {
	var re = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,30}$/);
	console.log(re.test(password));
	return re.test(password);
}

module.exports = router;
