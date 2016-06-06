var mongoose = require('mongoose');

var songsheetSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please name your songsheet."]
	},
	artist: {
		type: String,
	},
	_creator: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	data: {
		type: String,
		required: [true, "Nothing to save!?"]
	}
});

var Songsheet = mongoose.model('Songsheet', userSchema);

module.exports = Songsheet;