var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/User');
var Auth = require('../middlewares/Authenticate');
var gravatarURL = require('../extra_modules/gravatar');

router.use(Auth.getLoggedInUser);
router.use(function(req,res,next){
	if (req.user) {
		next();
	}
	else {
		res.redirect('/login');
	}
});

router.get('/add/:username', function(req, res, next){
	var user = req.user;
	User.findOne({'username' : req.params.username}, function(err, otherUser) {
		if(err) return next(err);
		if(otherUser) {
			console.log("Trying to add " + JSON.stringify(otherUser));
			User.update({'_id': user._id}, {
				$addToSet : {
					friends : [
						otherUser._id
					]
				}
			}, function(errU, saveStat){
				if(errU) return next(errU);
				res.redirect('back');
				//res.redirect('/friends/index');
			});
		}
		else {
			var err = new Error("Page Not Found");
			err.status = 404;
			next(err);
		}
	});
});

router.get('/remove/:username', function(req, res, next){
	var user = req.user;
	User.findOne({'username' : req.params.username}, function(err, otherUser) {
		if (err) return next(err);
		if(otherUser) {
			console.log("Trying to remove " + JSON.stringify(otherUser));
			User.update({'_id': user._id}, {
				$pull : {
					friends : [
						otherUser._id
					]
				}
			}, function(errU, saveStat){
				if(errU) return next(errU);
				res.redirect('back');
				//res.redirect('/friends/index');
			});
		}
		else {
			var err = new Error("Page Not Found");
			err.status = 404;
			next(err);
		}
	});
});

router.get('/index', function(req, res, next){
	var user = req.user;
	makeFriendList(user,function(error, friends){
		if (error) return next(error);
		res.render('pages/friendList', { 'title': "Friends",
						'username': user.username, 'friendList': friends });
	});
});


// function to make a list of friends from their object id
var makeFriendList = function(user, callback) {
	var friends = [];
	var ara = user.friends;
	User.find( { '_id': { $in: ara } } ).stream()
		.on('data', function(friend){
			var friendData = {
				'username': friend.username,
				'url': "/user/" + friend.username,
				'profilePictureURL': gravatarURL(friend,75)
			}
			friends.push(friendData);
		})
		.on('error', function(err){
			return callback(err,null);
		})
		.on('end', function(){
			callback(null,friends);
		});
}

module.exports = router;
