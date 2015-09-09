var mongoose = require('mongoose');

var UserSchema = mongoose.Schema({
	name: {
		type: String,
		trim: true
	}
});

var User = mongoose.model('User', UserSchema);

module.exports = User;
