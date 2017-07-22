var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var statusSchema = new Schema({
	'_id': Schema.Types.ObjectId,
	'userId': Schema.Types.ObjectId,
    'status': String,
    'timeCreated': Date,
    'location': {
    	'longitude': Number,
    	'latitude': Number
    }
});

var Status = mongoose.model('status', statusSchema, 'statuses');
module.exports = Status;
