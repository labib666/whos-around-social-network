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
			User.update({'username': user.username}, {
				$addToSet : {
					friends : [
						otherUser._id
					]
				}
			}, function(err, savedUser){
				if(err) {
					console.log(err);
				}
				console.log(savedUser);
				res.redirect('/friends/index');
			});
		}
		else {
			res.redirect('/user');
		}
	});
});

router.get('/remove/:username', Auth.getCurrentUser, function(req, res){
	var user = req.user;
	User.findOne({'username' : req.params.username}, function(err, otherUser) {
		if(err) throw err;
		if(otherUser) {
			console.log('Trying to remove ' + otherUser);
			console.log(user.friends);
			User.update({'username': user.username}, {
				$pull : {
					friends : [
						otherUser._id
					]
				}
			}, function(err, savedUser){
				if(err) {
					console.log(err);
				}
				console.log(savedUser);
				res.redirect('/friends/index');
			});
		}
		else {
			res.redirect('/user');
		}
	});
});

router.get('/index', Auth.getCurrentUser, function(req, res){
	var user = req.user;
	res.send(user.friends);
});

module.exports = router;
