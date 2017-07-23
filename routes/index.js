var express = require('express');
var router = express.Router();
var Auth = require('../middlewares/Authenticate');

/* GET home page. */
router.get('/', Auth.getLoggedInUser, function(req, res, next) {
	if (req.user) {
		res.redirect('/dashboard');
	}
	else {
		res.render('pages/index', { title: "Who\'s Around" });
	}
});

module.exports = router;
