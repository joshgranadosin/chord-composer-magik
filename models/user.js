var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var userSchema = new mongoose.Schema({
	email: {
		type: String,
		validate: {
			validator: function(v) {
				return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
			},
			message: "Must use a valid email address."
		},
		required: [true, "Must have an email address to register."],
		unique: true
	},
	password: {
		type: String,
		min: [8, "Your password must be 8-20 characters."],
		max: [20, "Your password must be 8-20 characters."],
		required: [true, "Your password must be 8-20 characters."]
	},
	songsheets: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Songsheet'
	}]
});

userSchema.pre('save', function(next){
	var self = this;
	bcrypt.hash(self.password, 10, function(err, hash){
		if(err) {
			return next(err);
		}
    self.password = hash;
    self.email = self.email.toLowerCase();
    console.log("succeeded hash");
    next();
	});
});

var User = mongoose.model('User', userSchema);

module.exports = User;