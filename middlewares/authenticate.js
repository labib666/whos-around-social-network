var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');


app.use(cookieParser());


/*	getLoggedInUser: 
	takes the request received by router,
	autheticates if someone is logged in, 
	and if so, returns user email,
	otherwise returns null
 */

module.exports.getLoggedInUser = function (req, callback) {

	var res;

	if (req.cookies.api_token == "" || req.cookies.api_token == null) {
		console.log("no api_token");
		res = null;
		callback(null, null);
	} 
	else {
		var api_token = req.cookies.api_token;
	  	console.log("at authenticate:");
	  	console.log(req.cookies);

	  	var users = mongoose.model('users');

		users.count({ 'api_token': api_token }, function(errC, retC) {
		  	if (errC) console.error(errC);
		  	console.log("retC = " + retC);
		  	if (retC === 0) {
		  		// logged out
		  		callback(null, null);
		  	}
		  	else {
		  		// logged in
		  		users.findOne({ 'api_token': api_token }, function(errF, retF) {
		  			if (errF) console.error(errF);
		  			console.log("retF = " + JSON.stringify(retF.email));
		  			res = JSON.stringify(retF.email);
		  			callback(null, res);
		  		});
		  	}
		  	
		});
	}
}
