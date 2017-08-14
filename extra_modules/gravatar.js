var express = require('express');
var md5 = require('md5');

// making gravatar url with given dimension
var gravatarURL = function(user,dimension) {
	var defaultURL = encodeURIComponent("https://via.placeholder.com/"+dimension+"x"+dimension);
	return "https://www.gravatar.com/avatar/" + md5(user.email.toLowerCase())
								+ "?s="+dimension+"&d=" + defaultURL;
}

module.exports = gravatarURL;
