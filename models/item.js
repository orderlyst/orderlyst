module.exports = function(sequelize, DataTypes) {
	"use strict";
  var Item = sequelize.define("Item", {
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
