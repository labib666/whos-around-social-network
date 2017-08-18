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

var makeStatusList = function(user, originUser, listOfPeople, maxDistanceInKM, callback) {
	var promises = [];
	var statusList = [];
	var maxDistance = 1000 * maxDistanceInKM;
	var coords_origin = originUser.location.latitude.toString()+","+originUser.location.longitude.toString();
	console.log(coords_origin);
	Status.find( { 'userId': { $in: listOfPeople } } ).stream()
		.on('data', function(doc){
			//console.log(doc);
			var coords_data = doc.location.latitude.toString()+","+doc.location.longitude.toString();
			promises.push( new Promise(function(resolve,reject) {
				distance.get(
					{
						'origin': coords_origin,
						'destination': coords_data,
						'mode': "walking"
					}, function(errD,data) {
						if (errD) return reject(errD);
						//console.log(data);
						if (data.distanceValue <= maxDistance) {
							var dbPromise = new Promise(function(resolve,reject){
								var statusData = {
									'timeCreated' : doc.timeCreated,
									'date': human((Date.now()-doc.timeCreated)/1000),
									'status': nl2br(htmlspecialchars(doc.status)),
									'distance': data.distance
								}
								User.findOne({'_id': doc.userId}, function(errF, friend){
									if (errF) reject(errF);
									statusData.username = friend.username;
									statusData.profilePictureURL = gravatarURL(friend,75);
									statusList.push(statusData);
									resolve();
								});
							});
							dbPromise
								.then(function(){
									resolve();
								})
								.catch(function(errDB){
									reject(errDB);
								});
						}
						else {
							resolve();
						}
					}
				);
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
