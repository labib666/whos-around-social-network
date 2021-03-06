var express = require('express');
var sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/***
	sends out email to user with a verification link
**/
var sendEmail = function(user, hostname, callback) {
	var expiryTime = user.createdAt;
	expiryTime.setDate(expiryTime.getDate()+1);
	msg = {
		to: user.email,
		from: 'noreply.whosaround@gmail.com',
		subject: 'Verify Your Account on "Who\'s Around"',
		text: makeEmailText(user,hostname,expiryTime),
		html: makeEmailHTML(user,hostname,expiryTime)
	};
	sgMail.send(msg, function(err, result) {
		if (err) return callback(err,null);
		callback(null, result);
	});
}

var makeEmailText = function(user, hostname, expiryTime) {
	var text = "";
	text += "Hello " + user.username + "!\n";
	text += "Welcome to 'Who\'s Around'! :)\n";
	text += "Please visit the following link to verify your account:\n";
	text += "<a href='https://" + hostname +  "/verify/" + user.api_token + "'>Verify</a>\n";
	text += "This link will expire at " + expiryTime.toUTCString() + ".\n";
	text += "Please ignore this email if it was not you who wanted to open the new account.\n";
	text += "Regards,\nLabib Rashid,\nWho\'s Around\n";
	text += "Please do not reply to this email. We no longer maintain the email address.";
	return text;
}

var makeEmailHTML = function(user, hostname, expiryTime) {
	var text = "";
	text += "<h2>Hello " + user.username + "!</h2><br>";
	text += "<h3>Welcome to 'Who\'s Around'! :)</h3><br>";
	text += "<h4>Please visit the following link to verify your account:</h4><br><br>";
	text += "<h3><a href='https://" + hostname +  "/verify/" + user.api_token + "'>Verify</a></h3><br>";
	text += "<h4>This link will expire at " + expiryTime.toUTCString() + ".<br><br>";
	text += "Please ignore this email if it was not you who wanted to open the new account.</h4><br><br>";
	text += "<h3>Regards,<br>Labib Rashid,<br>Who\'s Around</h3><br/>";
	text += "<p>Please do not reply to this email. We no longer maintain the email address.</p>";
	return text;
}

module.exports = sendEmail;
