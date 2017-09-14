var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	'_id': Schema.Types.ObjectId,
	'username': String,
	'api_token': String,
	'createdAt': {
		type: Date,
		expires: '1d',
		default: Date.now
	}
});

var Recover = mongoose.model('recover', userSchema, 'recover');
module.exports = Recover;
