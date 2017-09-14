var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	'_id': Schema.Types.ObjectId,
	'username': String,
	'email': String,
	'password': String,
	'api_token': String,
	'createdAt': {
		type: Date,
		expires: '30s',
		default: Date.now
	}
});

var Verify = mongoose.model('verify', userSchema, 'verify');
module.exports = Verify;
