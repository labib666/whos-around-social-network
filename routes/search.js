var express = require('express');
var router = express.Router();
var app = express();
var md5 = require('md5');
var bodyParser= require('body-parser');
var mongoose = require('mongoose');
var User = require('../models/User');
var Auth = require('../middlewares/Authenticate');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
router.use(Auth.getLoggedInUser);

router.get('/', function(req, res, next) {
	console.log(req.query);
	if (req.user) {
		generateResults(req.query.data, function(err,locals) {
			if (err) return next(err);
			console.log(locals);
			res.json(locals);
			//res.render('pages/results', locals);
		});
	}
	else {
		res.redirect('/login');
	}
});

var generateResults = function(searched,callback) {
	var data = new Array();
	console.log(data);
	data = editDistance(searched,0,2,"",data);
	console.log("hasib" in data);

	var locals = {
		'title': "Search Results"
	};

	locals.resultList = [];
	User.find( { $or: [ { 'username': { $in: data } }, { 'email': { $in: data } } ] } ).stream()
		.on('data', function(user) {
			var result = {
				'username': user.username,
				'profilePictureURL': gravatarURL(user),
				'distance': getDistance(searched,0,user.username,0,[]).val
			};
			locals.resultList.push(result);
		})
		.on('error', function(err) {
			return next(err);
		})
		.on('end', function() {
			locals.resultList.sort(predicateBy('distance'));
			console.log(locals);
			callback(null,locals);
		});
}

// populate possible searched terms
// from the actual searched term
var editDistance = function(searched,position,distanceLeft,curString,data) {
	//console.log(searched,position,distanceLeft,curString,data);
	if (curString == "h") console.log("here");
	if (searched.length == position) {
		data.push(curString);
		return data;
	}
	if (distanceLeft == 0) {
		return editDistance(searched,position+1,
					distanceLeft,curString+searched.charAt(position),data);
	}
	for (var i=97; i<=122; i++) {
		//console.log(i,String.fromCharCode(i));
		if (searched.charAt(position) == String.fromCharCode(i)) {
			data = editDistance(searched,position+1,
							distanceLeft,curString+String.fromCharCode(i),data);
		}
		else {
			data = editDistance(searched,position+1,
							distanceLeft-1,curString+String.fromCharCode(i),data);
		}
		//console.log(position,distanceLeft,data);
	}
	return data;
}

// populate possible searched terms
// from the actual searched term
var getDistance = function(searched,positionS,generated,positionG,seen) {
	if (positionS == searched.length) return {
		'val': 0,
		'seen': seen
	};
	if (positionG == generated.length) return {
		'val': 0,
		'seen': seen
	};
	if (seen.indexOf({'ps':positionS,'pg':positionG}) != -1) {
		return {
			'val': seen[{'ps':positionS,'pg':positionG}],
			'seen': seen
		}
	}

	var val = 500;

	if (searched.charAt(positionS) == generated.charAt(positionG)) {
		var v1 = getDistance(searched,positionS+1,generated,positionG+1,seen);
		seen = v1.seen;
		val = v1.val;
	}

	var v2 = getDistance(searched,positionS+1,generated,positionG,seen);
	v2.val += 1;
	seen = v2.seen;
	val = (val > v2.val) ? v2.val : val;

	var v3 = getDistance(searched,positionS,generated,positionG+1,seen);
	v3.val += 1;
	seen = v3.seen;
	val = (val > v3.val) ? v3.val : val;

	seen[{'ps':positionS,'pg':positionG}] = val;
	return {
		'val': val,
		'seen': seen
	}
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

// making gravatar url
var gravatarURL = function(user) {
	var defaultURL = encodeURIComponent("http://via.placeholder.com/75x75");
	return "https://www.gravatar.com/avatar/" + md5(user.email.toLowerCase())
								+ "?s=75&d=" + defaultURL;
}

module.exports = router;
