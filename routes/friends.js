var express = require('express');
var router = express.Router();
var Auth = require('../middlewares/Auth');
var User = require('../models/User');

router.get('/add/:username', Auth.getCurrentUser, function(req, res){
	var user = req.user;
	User.findOne({'username' : req.params.username}, function(err, otherUser) {
		if(err) throw err;
		if(otherUser) {
			console.log('Trying to add ' + otherUser);
			User.update(user, {
				$addToSet : {
					friends : [
						otherUser._id
					]
				}
			}, function(err){
				if(err) {
					console.log(err);
				}

			});
		}
		res.redirect('/friends/index');
	});
});

router.get('/index', Auth.getCurrentUser, function(req, res){
	var user = req.user;
	res.send(user.friends);
});

module.exports = router;
