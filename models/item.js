var idTransform = require('../middlewares/id-transform');

module.exports = function(sequelize, DataTypes) {
	"use strict";
  var Item = sequelize.define("Item", {
    "itemId": {
      "type": DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    "name":{
				"type": DataTypes.STRING
			},
    "price":{
				"type": DataTypes.FLOAT
			}
  }, {
    classMethods: {
      associate: function(models) {
        Item.belongsTo(models.User, {
          "onDelete": "NO ACTION",
          "foreignKey": {
            allowNull: false
          }
        });

        Item.belongsTo(models.Order, {
          "onDelete": "NO ACTION",
          "foreignKey": {
            allowNull: false
          }
        });
      }
    },
    "getterMethods": {
      "UserUserId": function() {
        return idTransform.encrypt(this.getDataValue('UserUserId'));
      },
      "OrderOrderId": function() {
        return idTransform.encrypt(this.getDataValue('OrderOrderId'));
      }
    },
    "setterMethods": {
      "name": function(value) {
        this.setDataValue(
          "name",
          value.split(" ")
               .map(function(word) {
                 if (word.length === 0) {
                   return "";
                 } else {
                   return word[0].toUpperCase() + word.substring(1, word.length).toLowerCase();
                 }
               })
               .join(" ")
        );
      }
    }
  });

  return Item;
};
