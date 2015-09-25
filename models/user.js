var idTransform = require('../middlewares/id-transform');

module.exports = function(sequelize, DataTypes) {
	"use strict";
  var User = sequelize.define(
		"User",
		{
			"userId": {
				"type": DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				get: function() {
					return idTransform.encrypt(this.getDataValue('userId'));
				}
			},
			"name":{
				"type": DataTypes.STRING
			}
		},
		{
			"collate": "utf8_general_ci"
		}
	);

	return User;
};
