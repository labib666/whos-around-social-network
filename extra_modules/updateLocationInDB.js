var mongoose = require('mongoose');
var User = require('../models/User');
var Status = require('../models/Status');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

function updateInDB(user,coords,ip,callback) {
	//console.log(user,coords,ip);
	if (coords.lat == null || coords.long == null) {
		getCoordinatesForIP(ip,function(err,res){
			if (err) return callback(err,null);
			//console.log(res.latitude,res.longitude);
			var Res = {
				'latitude': res.latitude,
				'longitude': res.longitude
			};
			if (res.latitude == 0 && res.longitude == 0) {
				// set default location -> now NSU
				// implement user setting and use their city location as default
				Res.latitude = 23.815;
				Res.longitude = 90.425;
			}
			user.location = {
				'latitude': Res.latitude,
				'longitude': Res.longitude
			};
			user.save(function(err,savedUser) {
				if (err) callback(err,null);
				else {
					console.log("updated location for " + savedUser.username);
					//console.log(savedUser);
					callback(null,savedUser);
				}
			});
		});
	}
	else {
		user.location.latitude = coords.lat;
		user.location.longitude = coords.long;
		user.save( function(err,savedUser) {
			if (err) callback(err,null);
			else {
				console.log("updated location for " + savedUser.username);
				//console.log(savedUser);
				callback(null,savedUser);
			}
		});
	}
}

function getCoordinatesForIP(ip,callback) {
	var url = "https://freegeoip.net/json/"+ip;
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() {
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
			//console.log(xmlHttp.responseText);
			callback(null,JSON.parse(xmlHttp.responseText));
		}
	}
	xmlHttp.onerror = function() {
		var err = new Error(xmlHttp.statusText);
		err.status = xmlHttp.status;
		callback(err,null);
	}
	xmlHttp.open("GET", url, true); // true for asynchronous
	xmlHttp.send(null);
}

module.exports= updateInDB;
