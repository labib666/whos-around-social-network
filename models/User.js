var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	'_id': Schema.Types.ObjectId,
	'username': String,
	'email': String,
	'password': String,
	'api_token': String,
	'friends': [Schema.Types.ObjectId],
	'location': {
		'longitude': Number,
		'latitude': Number
	}
});

var User = mongoose.model('user', userSchema, 'users');
module.exports = User;
