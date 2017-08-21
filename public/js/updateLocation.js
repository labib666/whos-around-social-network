// send location of the user as soon as the document loads

$(document).ready(function(){
	var refreshInterval = setInterval(sendGeoLocation,300000);
	sendGeoLocation();
});

function sendGeoLocation(){
	var details = {
		'lat': null,
		'long': null
	};
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(
			function(position) {
				details.lat = position.coords.latitude;
				details.long = position.coords.longitude;
				sendUpdate(details);
			},
			function(error){
				console.error(error);
				sendUpdate(details);
			}
		);
	}
}

function sendUpdate(details) {
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
