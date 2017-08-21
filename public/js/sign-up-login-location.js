// send location of the user as soon as the document loads

$(document).ready(function(){
	sendGeoLocation();
});

function sendGeoLocation(){
	var details = {
		'longitude': null,
		'latitude': null
	};
	if (navigator.geolocation) {
		navigator.geolocation.watchPosition(
			function(position) {
				details.latitude = position.coords.latitude;
				details.longitude = position.coords.longitude;
				sendUpdate(details);
			},
			function(error){
				console.log(error);
				sendUpdate(details);
			}
		);
	}
}

function sendUpdate(details) {
	console.log(details);
	$('input[name="lat"]').val(details.latitude);
	$('input[name="long"]').val(details.longitude);
}
