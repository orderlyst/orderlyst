var express = require('express');
var router = express.Router();
var OrderModel = require('../../models/order');
var UserModel = require('../../models/user');
var Join = require('join').Join;

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

/**
 * To create a new order item
 */
router.post('/:id/items', function(req, res, next) {
  var orderId = req.params.id;
  var userId = req.body.user;
  var join = Join.create();
  OrderModel
    .findOne({
      "_id": orderId
    })
    .exec(join.add());

  UserModel
    .findOne({
      "_id": userId
    })
    .exec(join.add());

  join.then(function(orderCallback, userCallback){
    var order = orderCallback[1];
    var user = userCallback[1];
    if (order && user) {
      order.items.push({
        name: req.body.name,
        price: req.body.price,
        user: user._id
      });
      order.save(function(err){
        res.json(order.items[order.items.length - 1]);
      });
    } else {
      next();
    }
  });
});

/**
 * To delete a order item
 */
router.delete('/:id/items/:itemId', function(req, res, next){
  var orderId = req.params.id;
  var itemId = req.params.itemId;
  OrderModel
    .findOne({
      "_id": orderId
    })
    .exec(function(err, order){
      order.items.id(itemId).remove();
      order.save();
      res.json({status: "200 OK"});
    });
});

module.exports = router;
