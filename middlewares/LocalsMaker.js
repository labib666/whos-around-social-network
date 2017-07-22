var express = require('express');
var app = express();
var mongoose = require('mongoose');
var User = require('../models/User');
var Status = require('../models/Status');


/**

 */

module.exports.ownProfile = function (user, callback) {
	var err = null;
	var res = {
		'title': user.username,
		'username': user.username
	}
	// find own status and use it here
	res.statusList = "";
	Status.find({'userId': user._id}).stream()
		.on('data', function(doc){
			console.log(res.statusList);
			var date = doc.timeCreated;
			var status = doc.status;
			res.statusList = res.statusList + date + "<br>";
			res.statusList = res.statusList + status + "<br>";
		})
		.on('error', function(err){
			console.error(err);
		})
		.on('end', function(){
			callback(err,res);
		});
}

module.exports.friendProfile = function (user, callback) {
	var err = null;
	var res = {
		'title': user.username,
		'username': user.username
	}
	res.statusList = "";
	// find friend's status and use it here
	Status.find({'userId': user._id}).stream()
		.on('data', function(doc){
			console.log(res.statusList);
			var date = doc.timeCreated;
			var status = doc.status;
			res.statusList = res.statusList + date + "<br>";
			res.statusList = res.statusList + status + "<br>";
		})
		.on('error', function(err){
			console.error(err);
		})
		.on('end', function(){
			callback(err,res);
		});
}

module.exports.publicProfile = function (user, callback) {
	var err = null;
	var res = {
		'title': user.username,
		'username': user.username
	}
	callback(err,res);
}
