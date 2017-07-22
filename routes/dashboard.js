var express = require('express');
var router = express.Router();
var app = express();
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var User = require('../models/User');
var Auth = require('../middlewares/Authenticate');

app.use(cookieParser());
router.use(Auth.getLoggedInUser);

router.get('/', function(req, res, next) {
	if (req.user) {
		res.render('dashboard', {
			'title': "Dashboard",
			'username': req.user.username
	  	});
	}
	else {
		res.redirect('/login');
	}
});


module.exports = router;
