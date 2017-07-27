var express = require('express');
var router = express.Router();
var app = express();
var bodyParser= require('body-parser');
var cookieParser = require('cookie-parser');
var randomstring = require("randomstring");
var mongoose = require('mongoose');
var User = require('../models/User');
var Auth = require('../middlewares/Authenticate');

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
router.use(Auth.getLoggedInUser);

router.get('/', function(req, res, next) {
	if (req.user) {
		res.redirect('/');
	}
	else {
		var duplicateEmail = (req.cookies.duplicateEmail) ? true : false;
		var duplicateUser = (req.cookies.duplicateUser) ? true : false;
		res.clearCookie('duplicateEmail');
		res.clearCookie('duplicateUser');
		res.render('pages/signup', {
			'title': "Sign Up",
			'duplicateEmail': duplicateEmail,
			'duplicateUser': duplicateUser
		});
	}
})


router.post('/', function(req, res, next) {
	console.log("request received to signup new user");

	if (req.user) {
		console.log("user already logged in. redirecting to dashboard");
		res.redirect('/');
	}
	else {
		console.log(req.body);

		var username = req.body.username;
		var email = req.body.email;
		var password = req.body.password;

		// entry validity check here. have to implement use of middleware later
		if (username == "" || email == "" || password == "") {
			console.log("invalid entry in one of the fields");
			res.redirect('/signup');
		}
		else {
			  User.findOne(  { 'email': email }, function (errFe, eUser) {
				if (errFe) return next(errFe);

				console.log("email is in use: " + (eUser!=null));

				if (eUser == null) {
					// unique email. check for unique username now
					User.findOne( { 'username': username }, function(errFu, uUser)  {
						if (errFu) return next(errFu);

						console.log("username is in use: " + (uUser!=null));

						if (uUser == null) {
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
						else {
							console.log("redirecting to signup");

							// set cookie to tell signup about duplicate username
							res.cookie('duplicateUser', true);

							res.redirect('/signup');
						}
					});
				}
				else {
					console.log("redirecting to signup");

					// set cookie to tell signup about duplicate email
					res.cookie('duplicateEmail', true);

					res.redirect('/signup');
				}
			  });
		  }
	}
});

module.exports = router;
