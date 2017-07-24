var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/User');
var Auth = require('../middlewares/Authenticate');

router.use(Auth.getLoggedInUser);

router.get('/add/:username', function(req, res){
	var user = req.user;
	if (user) {
		User.findOne({'username' : req.params.username}, function(err, otherUser) {
			if(err) console.error(err);
			if(otherUser) {
				console.log("Trying to add " + JSON.stringify(otherUser));
				User.update({'_id': user._id}, {
					$addToSet : {
						friends : [
							otherUser._id
						]
					}
				}, function(errU, saveStat){
					if(errU) console.error(errU);
					res.redirect('back');
					//res.redirect('/friends/index');
				});
			}
			else {
				res.status(404)
					.send("404: User Not Found");
			}
		});
	}
	else {
		res.redirect('/login');
	}
});

router.get('/remove/:username', function(req, res){
	var user = req.user;
	if (user) {
		User.findOne({'username' : req.params.username}, function(err, otherUser) {
			if(err) console.error(err);
			if(otherUser) {
				console.log("Trying to remove " + JSON.stringify(otherUser));
				User.update({'_id': user._id}, {
					$pull : {
						friends : [
							otherUser._id
						]
					}
				}, function(errU, saveStat){
					if(errU) console.error(errU);
					res.redirect('back');
					//res.redirect('/friends/index');
				});
			}
			else {
				res.status(404)
					.send("404: User Not Found");
			}
		});
	}
	else {
		res.redirect('/login');
	}
});

router.get('/index', function(req, res){
	var user = req.user;
	if (user) {
		makeFriendList(user,function(error, friends){
			res.render('pages/friendList', { 'title': "Friends", 'friendList': friends });
		});
	}
	else {
		res.redirect('/login');
	}
});


// function to make a list of friends from their object id
var makeFriendList = function(user, callback) {
	var friends = [];
	var ara = user.friends;
	User.find( {'_id': { $in: ara } } ).stream()
		.on('data', function(friend){
			var friendData = {
				'username': friend.username,
				'url': "/user/" + friend.username
			}
			friends.push(friendData);
		})
		.on('error', function(err){
			console.error(err);
		})
		.on('end', function(){
			callback(null,friends);
		});
}

module.exports = router;
