var express = require('express');
var express = require('express');
var router = express.Router();
var bodyParser= require('body-parser');
var cookieParser = require('cookie-parser');
var htmlspecialchars = require('htmlspecialchars');
var sendEmail = require('../extra_modules/sendEmail');
var updateInDB = require('../extra_modules/updateLocationInDB');
var bcrypt = require('bcrypt');
var randomstring = require("randomstring");
var mongoose = require('mongoose');
var User = require('../models/User');
var Verify = require('../models/Verify');
var Auth = require('../middlewares/Authenticate');

router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));
router.use(Auth.getLoggedInUser);
router.use(function(req,res,next){
	if (req.user) {
		//console.log("user already logged in. redirecting to dashboard");
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
	var userValue = (req.cookies.userValue) ? req.cookies.userValue : null;
	var emailValue = (req.cookies.emailValue) ? req.cookies.emailValue : null;
	var verification = (req.cookies.verification) ? req.cookies.verification : null;
	res.clearCookie('emailError');
	res.clearCookie('userError');
	res.clearCookie('passwordError');
	res.clearCookie('userValue');
	res.clearCookie('emailValue');
	res.clearCookie('verification');
	res.render('pages/signup', {
		'title': "Sign Up",
		'emailError': emailError,
		'userError': userError,
		'passwordError': passwordError,
		'userValue': htmlspecialchars(userValue),
		'emailValue': htmlspecialchars(emailValue),
		'verification': verification,
		'csrfToken' : req.csrfToken()
	});
})


router.post('/', function(req, res, next) {
	console.log("request received to signup new user");
	console.log(req.body);

	var username = req.body.username.toLowerCase();
	var email = req.body.email.toLowerCase();
	var password = req.body.password;
	var coords = {
		'lat': req.body.lat,
		'long': req.body.long
	}

	// entry validity check here. have to implement use of middleware later
	if (username == "" || email == "" || password == "") {
		//console.log("invalid entry in one of the fields");
		res.cookie('userError', "FORMAT_MISMATCH");
		res.cookie('userValue', username);
		res.cookie('emailValue', email);
		res.redirect('/signup');
	}
	else {
		User.findOne( { 'username': username }, function(errFu, uUser)  {
			if (errFu) return next(errFu);
			//console.log("username is in use: " + (uUser!=null));
			if (uUser == null) {
				// unique username. check for unique email now
				User.findOne(  { 'email': email }, function (errFe, eUser) {
					if (errFe) return next(errFe);
					//console.log("email is in use: " + (eUser!=null));
					if (eUser == null) {
						// unique email. match with regex now
						if (emailRegexCheck(email) == false) {
							res.cookie('emailError', "FORMAT_MISMATCH");
							res.cookie('userValue', username);
							res.cookie('emailValue', email);
							res.redirect('/signup');
						}
						else if (userRegexCheck(username) == false) {
							res.cookie('userError', "FORMAT_MISMATCH");
							res.cookie('userValue', username);
							res.cookie('emailValue', email);
							res.redirect('/signup');
						}
						else if (passwordRegexCheck(password) == false) {
							res.cookie('passwordError', "FORMAT_MISMATCH");
							res.cookie('userValue', username);
							res.cookie('emailValue', email);
							res.redirect('/signup');
						}
						// everything is fine. nothing weird of fishy. save user now
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
										'api_token': randomstring.generate(50),
										'location': {
											'latitude': 0.0,
											'longitude': 0.0
										}
									});
									console.log("saving new user: ", newUser);
									var ip = req.headers['x-forwarded-for'] ||
												req.connection.remoteAddress ||
												req.socket.remoteAddress ||
												req.connection.socket.remoteAddress;
									updateInDB(newUser,coords,ip,function(err,savedUser){
										if (err) return next(err);
										//console.log("signup successful. now verify");
										//send verification email
										sendEmail(savedUser, req.hostname, function(errEmail, result){
											if (errEmail) return next(errEmail);
											res.cookie('verification', "REQUIRED");
											res.redirect('/login');
										});
									});
								});
							});
						}
					}
					else {
						//console.log("redirecting to signup");
						// set cookie to tell signup about duplicate email
						res.cookie('emailError', "DUPLICATE_DATA");
						res.cookie('userValue', username);
						res.cookie('emailValue', email);
						res.redirect('/signup');
					}
				});
			}
			else {
				//console.log("redirecting to signup");
				// set cookie to tell signup about duplicate username
				res.cookie('userError', "DUPLICATE_DATA");
				res.cookie('userValue', username);
				res.cookie('emailValue', email);
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
	//var re = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,30}$/);
	var re = new RegExp(/.{8,30}/);
	console.log(re.test(password));
	return re.test(password);
}

module.exports = router;
