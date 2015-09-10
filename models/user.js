module.exports = function(sequelize, DataTypes) {
	"use strict";
  var User = sequelize.define("User", {
		"userId": {
			"type": DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true // Automatically gets converted to SERIAL for postgres
		},
		"name":{
			"type": DataTypes.STRING
		}
	});

	return User;
};
