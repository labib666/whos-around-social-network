var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	'_id': Schema.Types.ObjectId,
	'username': String,
	'email': String,
	'password': String,
	'api_token': String,
	'location': {
		'longitude': Number,
		'latitude': Number
	},
	'createdAt': {
		type: Date,
		expires: '1d',
		default: Date.now
	}
});

var Verify = mongoose.model('verify', userSchema, 'verify');
module.exports = Verify;
