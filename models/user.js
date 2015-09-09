var mongoose = require('mongoose');

var UserSchema = mongoose.Schema({
	name: {
		type: String,
		trim: true
	}
});

var UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
