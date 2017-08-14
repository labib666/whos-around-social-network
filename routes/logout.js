var express = require('express');
var router = express.Router();
var cookieParser = require('cookie-parser');
var Auth = require('../middlewares/Authenticate');

router.use(cookieParser());
router.use(Auth.getLoggedInUser);

router.get('/', function(req, res, next) {
	if (req.user) {
		// clear cookies here
		res.clearCookie('api_token');

		res.redirect('/');
	}
	else {
		res.redirect('/login');
	}
});

module.exports = router;
