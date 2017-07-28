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
	//console.log(req.query);
	if (req.user) {
		if (req.query.data == "") {
			res.redirect('/');
		}
		generateResults(req.query.data.toLowerCase(), function(err,locals) {
			if (err) return next(err);
			res.render('pages/search', locals);
		});
	}
	else {
		res.redirect('/login');
	}
});

var generateResults = function(searched,callback) {
	var data = new Array();
	var mymap = new Array();
	var mapdata = editDistance(searched,0,"",0,2,data,mymap); //---------------------
	data = mapdata.data;
	mymap = mapdata.map;

	//console.log(mymap);

	var locals = {
		'title': "Search Results"
	};

	locals.resultList = [];
	User.find( { $or: [ { 'username': { $in: data } }, { 'email': { $in: data } } ] } ).stream()
		.on('data', function(user) {
			var result = {
				'username': user.username,
				'profilePictureURL': gravatarURL(user),
				'distance': mymap[user.username]
			};
			console.log(result);
			locals.resultList.push(result);
		})
		.on('error', function(err) {
			return next(err);
		})
		.on('end', function() {
			locals.resultList.sort(predicateBy('distance'));
			//console.log(locals);
			callback(null,locals);
		});
}

// populate possible searched terms
// from the actual searched term
var editDistance = function(searched,position,curString,distance,maxDistance,data,mymap) {
	//console.log(searched,position,distance,curString,data==null);
	if (distance == maxDistance) {
		if (position >= searched.length) {
			data.push(curString);
			mymap[curString] = distance;
			return {
				'data': data,
				'map': mymap
			};
		}
		else {
			return editDistance(searched,position+1,curString+searched.charAt(position),
					distance,maxDistance,data,mymap);
		}
	}

	var mapdata;

	for (var i=97; i<=122; i++) {
		if (position >= searched.length || searched.charAt(position) != String.fromCharCode(i)) {
			mapdata = editDistance(searched,position+1,curString+String.fromCharCode(i),
							distance+1,maxDistance,data,mymap);
			mymap = mapdata.map;
			data = mapdata.data;
		}
	}

	mapdata = editDistance(searched,position+1,curString,
					distance+1,maxDistance,data,mymap);
	mymap = mapdata.map;
	data = mapdata.data;

	if (position >= searched.length) {
		data.push(curString);
		mymap[curString] = distance;
	}
	else if (position < searched.length) {
		if (searched.length-position <= maxDistance-distance) {
			data.push(curString);
			mymap[curString] = distance;
		}
		mapdata = editDistance(searched,position+1,curString+searched.charAt(position),
						distance,maxDistance,data,mymap);
		mymap = mapdata.map;
		data = mapdata.data;
	}

	//console.log(position,distance,data);
	return {
		'data': data,
		'map': mymap
	};
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
