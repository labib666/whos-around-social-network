// send location of the user as soon as the document loads

$(document).ready(function(){
	var refreshInterval = setInterval(sendGeoLocation,300000);
	sendGeoLocation();
});

function sendGeoLocation(){
	var details = {};
	details.geoCoordinates = {
		'longitude': null,
		'latitude': null
	};
	details.ipCoordinates = {
		'longitude': null,
		'latitude': null
	};
	getCoordinatesForIP(function(err,responseText){
		if (err) {
			console.error(err);
		}
		else {
			var jsonResponse = JSON.parse(responseText);
			details.ipCoordinates.latitude = jsonResponse.latitude;
			details.ipCoordinates.longitude = jsonResponse.longitude;
		}
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				function(position) {
					details.geoCoordinates.latitude = position.coords.latitude;
					details.geoCoordinates.longitude = position.coords.longitude;
					sendUpdate(details);
				},
				function(error){
					console.log(error);
					sendUpdate(details);
				}
			);
		}
		else {
			sendUpdate(details);
		}
	});
}

function getCoordinatesForIP(callback) {
	var url = "https://freegeoip.net/json/";
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() {
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
			callback(null,xmlHttp.responseText);
		}
	}
	xmlHttp.onerror = function() {
		var err = new Error(xmlHttp.statusText);
		err.status = xmlHttp.status;
		callback(err,xmlHttp.statusText);
	}
	xmlHttp.open("GET", url, true); // true for asynchronous
	xmlHttp.send(null);
}

function sendUpdate(details) {
	console.log(JSON.stringify(details));
	$.ajax({
		'url': "/user/updateLocation",
		'type': "POST",
		'data': JSON.stringify(details),
		'contentType': "application/json",
		'dataType': "json",
		'success': function(res,status,xhr) {
			console.log(res);
		}
	});
}
