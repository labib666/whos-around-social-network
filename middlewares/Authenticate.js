var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var User = require('../models/User');


app.use(cookieParser());


/**
	getLoggedInUser:
	middleware that autheticates if someone is logged in
	and attaches the user object to the req object as 'req.user'.
	when no one is logged in, req.user = null
 */

module.exports.getLoggedInUser = function (req, res, next) {
	console.log("at authenticate:");
	if (req.cookies.api_token == null || req.cookies.api_token == "") {
		console.log("invalid api token.");
		req.user = null;
		next();
	}
	else {
		var api_token = req.cookies.api_token;
	  	console.log("current cookies: " + JSON.stringify(req.cookies));

		User.findOne({ 'api_token': api_token }, function(errC, user) {
		  	if (errC) console.error(errC);
			if (user) {
				// logged in
		  		console.log("currentUser = " + JSON.stringify(user));
				req.user = user;
				next();
		  	}
			else {
		  		// logged out
				console.log("no user logged in.")
		  		req.user = null;
				next();
		  	}
		});
	}
}
