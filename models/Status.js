var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	'userId': Schema.Types.ObjectId, 
    'status': String,
    'timeCreated': Date,
    'location': {
    	'longitude': Number,
    	'latitude': Number
    }
});

var Status = mongoose.model('status', userSchema);
module.exports = Status;
