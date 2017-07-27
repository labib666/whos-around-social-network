var express = require('express');
var router = express.Router();
var app = express();
var cookieParser = require('cookie-parser');
var md5 = require('md5');
var human = require('human-time');
var mongoose = require('mongoose');
var User = require('../models/User');
var Status = require('../models/Status');
var Auth = require('../middlewares/Authenticate');

app.use(cookieParser());
router.use(Auth.getLoggedInUser);

router.get('/', function(req, res, next) {
	if (req.user) {
		var user = req.user;
		dashboardLocals(user, function(err,locals) {
			if (err) return next(err);
			console.log(locals);
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
		'username': user.username
	}
	res.profilePictureURL = gravatarURL(user);
	// find friend's status and use it here
	res.statusList = [];
	var promises = [];
	Status.find( { 'userId': { $in: user.friends } } ).stream()
		.on('data', function(doc){
			console.log(doc);
			promises.push(new Promise(function(resolve,reject){
				var statusData = {
					'date': human((doc.timeCreated-Date.now())/1000),
					'status': doc.status
				}
				User.findOne({'_id': doc.userId}, function(errF, friend){
					if (errF) reject(errF);
					statusData.username = friend.username;
					statusData.profilePictureURL = gravatarURL(friend);
					res.statusList.push(statusData);
					resolve();
				});
			}));
		})
		.on('error', function(err){
			return next(err);
		})
		.on('end', function(){
			Promise.all(promises)
				.then(function(){
					res.statusList.sort(predicateBy('date'));
					callback(null,res);
				})
				.catch(function(err){
					return next(err);
				});
		});
}

// making gravatar url
var gravatarURL = function(user) {
	var defaultURL = encodeURIComponent("http://via.placeholder.com/75x75");
	return "https://www.gravatar.com/avatar/" + md5(user.email.toLowerCase())
								+ "?s=75&d=" + defaultURL;
}

// function to pass to array.sort() to sort array based on an attribute
// eg. yourArray.sort( predicateBy("age") );
function predicateBy(prop){
   return function(a,b){
	  if( a[prop] > b[prop]){
		  return 1;
	  } else if( a[prop] < b[prop] ){
		  return -1;
	  }
	  return 0;
   }
}

module.exports = router;
