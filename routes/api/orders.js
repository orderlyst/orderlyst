var express = require('express');
var router = express.Router();
var Join = require('join').Join;

/**
 * To fetch an order's information
 */
router.get('/:id', function(req, res, next) {
  var orderId = req.params.id;

  req.models.Order
    .find({
      "where": {
        orderId: orderId
      }
    })
    .then(function(order){
      res.json(order);
    });
});

/**
 * To create a new order
 */
router.post('/', function(req, res, next) {
  var hostId = req.body.hostUserId;

  req.models.User
    .find({
      "where": {
        userId: userId
      }
    })
    .then(function(user){
      req.models.Order
        .create({
          "host": user.userId,
        })
        .then(function(order){
          res.json(order);
        });
    });
});

/**
 * To fetch an order's items
 */
router.get('/:id/items', function(req, res, next) {
  var orderId = req.params.id;

  req.models.Item
    .find({
      "where": {
        orderId: orderId
      }
    })
    .then(function(items){
      res.json(items);
    });
});

/**
 * To create a new order item
 */
router.post('/:id/items', function(req, res, next) {
  var orderId = req.params.id;
  var userId = req.body.user;
  var join = Join.create();

  req.models.Order
    .find({
      "where": {
        orderId: orderId
      }
    })
    .then(join.add());

  req.models.User
    .find({
      "where": {
        userId: userId
      }
    })
    .then(join.add());

  join.then(function(orderCallback, userCallback){
    var order = orderCallback[0];
    var user = userCallback[0];
    if (order && user) {
      req.models.Item
        .create({
          "name": req.body.name,
          "price": req.body.price,
          "userId": user.userId
        })
        .then(function(item){
          res.json(item);
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

  req.models.Item
    .destroy({
      itemId: itemId,
      orderId: orderId
    });

  res.json({status: "200 OK"});
});

module.exports = router;
