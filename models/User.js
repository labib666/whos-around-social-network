var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	'_id' : Schema.Types.ObjectId,
	'username' : String,
	'email' : String,
	'password' : String,
	'api_token' : String,
	'friends' : [Schema.Types.ObjectId],
});

var User = mongoose.model('user', userSchema);
module.exports = User;
