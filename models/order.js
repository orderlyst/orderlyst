var randomCodeGenerator = function(){
  return Math.random().toString(36).substring(4,Math.random() * 2 + 8);
};

module.exports = function(sequelize, DataTypes) {
	"use strict";
  var Order = sequelize.define("Order", {
    "orderId": {
      "type": DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true // Automatically gets converted to SERIAL for postgres
    },
    "code": {
      "type": DataTypes.STRING,
      "defaultValue": ""
    },
    "surcharge": {
      "type": DataTypes.FLOAT,
      "defaultValue": 0
    },
    "tax": {
      "type": DataTypes.FLOAT,
      "defaultValue": 0
    },
    "isOpen": {
      "type": DataTypes.BOOLEAN,
      "defaultValue": true
    },
    "closed": {
      "type": DataTypes.DATE,
      allowNull: true
    }
  }, {
    "classMethods": {
      associate: function(models) {
        Order.belongsTo(models.User, {
          "onDelete": "NO ACTION",
          "foreignKey": {
            allowNull: false
          }
        });

        Order.hasMany(models.Item);
      }
    }
  });

  return Order;
};
