var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	'username' : String,
	'email' : String,
	'password' : String,
	'api_token' : String,
});

var User = mongoose.model('user', userSchema);
module.exports = User;
