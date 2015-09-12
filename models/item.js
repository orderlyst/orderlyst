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
    }
  });

  return Item;
};
