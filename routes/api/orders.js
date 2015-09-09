var express = require('express');
var router = express.Router();
var OrderModel = require('../../models/order');
var UserModel = require('../../models/user');

/**
 * To fetch an order's information
 */
router.get('/:id', function(req, res, next) {
  var orderId = req.params.id;
  OrderModel
    .findOne({
      "_id": orderId
    })
    .exec(function(err, order){
      if (order) {
        res.json(order);
      } else {
        next(err);
      }
    });
});

/**
 * To create a new order
 */
router.post('/', function(req, res, next) {
  var hostId = req.body.hostUserId;

  UserModel
    .findOne({
      "_id": hostId
    })
    .exec(function(err, user){
      if (user) {
        var order = new OrderModel({
          host: user._id
        });
        order.save(function(err) {
          res.json(order);
        });
      } else {
        next(err);
      }
    });

});

/**
 * To fetch an order's items
 */
router.get('/:id/items', function(req, res, next) {
  var orderId = req.params.id;
  OrderModel
    .findOne({
      "_id": orderId
    })
    .exec(function(err, order){
      if (order) {
        res.json(order.items);
      } else {
        next(err);
      }
    });
});

module.exports = router;
