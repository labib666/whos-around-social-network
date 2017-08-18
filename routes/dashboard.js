var express = require('express');
var router = express.Router();
var cookieParser = require('cookie-parser');
var Auth = require('../middlewares/Authenticate');
var gravatarURL = require('../extra_modules/gravatar');
var makeStatusList = require('../extra_modules/listStatus');

router.use(cookieParser());
router.use(Auth.getLoggedInUser);

router.get('/', function(req, res, next) {
	if (req.user) {
		var user = req.user;
		dashboardLocals(user, function(err,locals) {
			if (err) return next(err);
			//console.log(locals);
			res.render('pages/dashboard', locals);
		});
	}
	else {
		res.redirect('/login');
	}
});

// render dashboard view
var dashboardLocals = function (user, callback) {
	var res = {
		'title': "Dashboard",
		'username': user.username,
		'profilePictureURL': gravatarURL(user,150)
	}

	// find friend's status and use it here
	var friendList = user.friends;
	friendList.push(user._id);

	makeStatusList(user, friendList, 10, function(err,statusList) {
		if (err) return callback(err,null);
		res.statusList = statusList;
		callback(null,res);
	});
}

module.exports = router;
