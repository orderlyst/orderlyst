var randomCodeGenerator = function(){
  var max = 99999;
  var min = 458;
  return '' + (Math.floor(Math.random() * (max - min + 1)) + min);
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
      "defaultValue": randomCodeGenerator
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
