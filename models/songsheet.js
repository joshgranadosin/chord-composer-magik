var mongoose = require('mongoose');

var songsheetSchema = new mongoose.Schema({
	title: {
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
	chords: {
		type: Array
	},
	data: {
		type: String,
		required: [true, "Nothing to save!?"]
	},
	tabs: {
		type: String
	}
});

var Songsheet = mongoose.model('Songsheet', songsheetSchema);

module.exports = Songsheet;