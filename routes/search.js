var express = require('express');
var router = express.Router();
var app = express();
var bodyParser= require('body-parser');
var mongoose = require('mongoose');
var User = require('../models/User');
var Auth = require('../middlewares/Authenticate');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
router.use(Auth.getLoggedInUser);

router.get('/', function(req, res, next) {
	if (req.user) {
		var data = req.body.data;

	}
	else {
		res.redirect('/login');
	}
});

module.exports = router;
