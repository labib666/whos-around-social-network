var express = require('express');
var router = express.Router();
var bodyParser= require('body-parser');
var cookieParser = require('cookie-parser');
var htmlspecialchars = require('htmlspecialchars');
var sendRecoveryEmail = require('../extra_modules/sendRecoveryEmail');
var bcrypt = require('bcrypt');
var randomstring = require("randomstring");
var mongoose = require('mongoose');
var User = require('../models/User');
var Recover = require('../models/Recover');
var Auth = require('../middlewares/Authenticate');

router.use(cookieParser());
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

router.get('/', function(req, res, next) {
	var incorrectUser = (req.cookies.incorrectUser) ? true : false;
	var userValue = (req.cookies.userValue) ? req.cookies.userValue : null;
	res.clearCookie('incorrectUser');
	res.clearCookie('userValue');
	var locals = {
		'title': "Recover Account",
		'incorrectUser': incorrectUser,
		'userValue':  htmlspecialchars(userValue),
		'recover': "ENTER_EMAIL",
		'csrfToken' : req.csrfToken()
	};
	res.render('pages/recover', locals);
});

router.post('/', function(req, res, next) {
	console.log(req.body);

	var username = req.body.username.toLowerCase();

	if (username == "") {
		//console.log("invalid entry in one of the fields");
		res.redirect('/recover');
	}

	User.findOne( {$or:[ {'username': username}, {'email': username} ]}, function(errF, user) {
		if (errF) return next(errF);

		if (user == null) {
			res.cookie('incorrectUser', true);
			res.cookie('userValue', username);
			res.redirect('/recover');
		}

		else {
			var api_token = randomstring.generate(50);
			var recovery = new Recover({
				'_id': new mongoose.Types.ObjectId(),
				'username': user.username,
				'email': user.email,
				'api_token': api_token,
			});
			recovery.save(function(errS,savedRecovery){
				if (errS) return next(errS);
				sendRecoveryEmail(savedRecovery, req.hostname, function(err, response) {
					if (err) return next(err);
					res.cookie('verification', "REQUIRED");
					res.redirect('/login');
				});
			});
		}
	});
});

router.get('/:api_token', function(req, res, next) {
	var api_token = req.params.api_token;
	Recover.findOne( {'api_token': api_token}, function(err, user) {
		if (err) return next(err);
		if (user == null) {
			res.cookie('verification', "FAILED");
			res.redirect('/login');
		}
		else {
			var passwordError = (req.cookies.passwordError) ? req.cookies.passwordError : null;
			res.clearCookie('passwordError');
			res.render('pages/recover', {
				'title': "Recover Account",
				'passwordError': passwordError,
				'api_token': api_token,
				'recover': "ENTER_PASSWORD",
				'csrfToken' : req.csrfToken()
			});
		}
	});
});

router.post('/:api_token', function(req, res, next) {
	console.log(req.body);

	var password = req.body.password;

	var api_token = req.params.api_token;
	Recover.findOne( {'api_token': api_token}, function(err, user) {
		if (err) return next(err);
		if (user == null) {
			res.cookie('verification', "FAILED");
			res.redirect('/login');
		}
		else {
			if (passwordRegexCheck(password) == false) {
				res.cookie('passwordError', "FORMAT_MISMATCH");
				res.redirect('/recover/'+api_token);
			}
			else {
				var rounds = parseInt(process.env.BCRYPT_SALT_ROUNDS);
				bcrypt.genSalt(rounds,function(errS, salt){
					if (errS) return next(errS);
					bcrypt.hash(password,salt,function(errH,hash){
						if (errH) return next(errH);
						User.update( {'username': user.username}, { $set: {'password': hash} }, function(errF, savedStats) {
							if (errF) return next(errF);
							user.api_token = randomstring.generate(50);
							user.save(function(errS, savedUser) {
								if (errS) return next(errS);
								res.cookie('verification', "SUCCESSFUL");
								res.redirect('/login');
							});
						});
					});
				});
			}
		}
	});
});

var passwordRegexCheck = function(password) {
	//var re = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,30}$/);
	var re = new RegExp(/.{8,30}/);
	console.log(re.test(password));
	return re.test(password);
}

module.exports = router;
