var express = require('express');
var human = require('human-time');
var htmlspecialchars = require('htmlspecialchars');
var nl2br = require('nl2br');
var distance = require('google-distance');
var mongoose = require('mongoose');
var User = require('../models/User');
var Status = require('../models/Status');
var predicateBy = require('../extra_modules/predicate');
var gravatarURL = require('../extra_modules/gravatar');

var makeStatusList = function(listOfPeople, maxDistance, callback) {
	var promises = [];
	var statusList = [];
	Status.find( { 'userId': { $in: listOfPeople } } ).stream()
		.on('data', function(doc){
			//console.log(doc);
			promises.push(new Promise(function(resolve,reject){
				var statusData = {
					'timeCreated' : doc.timeCreated,
					'date': human((Date.now()-doc.timeCreated)/1000),
					'status': nl2br(htmlspecialchars(doc.status))
				}
				User.findOne({'_id': doc.userId}, function(errF, friend){
					if (errF) reject(errF);
					statusData.username = friend.username;
					statusData.profilePictureURL = gravatarURL(friend,75);
					statusList.push(statusData);
					resolve();
				});
			}));
		})
		.on('error', function(err){
			return callback(err,null);
		})
		.on('end', function(){
			Promise.all(promises)
				.then(function(){
					statusList.sort(predicateBy('timeCreated'));
					callback(null,statusList);
				})
				.catch(function(err){
					return callback(err,null);
				});
		});
}

module.exports = makeStatusList;
