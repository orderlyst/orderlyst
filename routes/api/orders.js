var express = require('express');
var router = express.Router();
var Join = require('join').Join;
var idTransform = require('../../middlewares/id-transform');

/**
 * To search for an order
 */
router.post('/search', function(req, res, next) {
  var code = req.body.code;

  req.models.Order
    .find({
      "where": {
        "code": code,
        "isOpen": true
      }
    })
    .then(function(orders){
      res.json(orders);
    });
});

/**
 * To fetch an order's information
 */
router.get('/:id', function(req, res, next) {
  var orderId = idTransform.decrypt(req.params.id);

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
  var hostId = idTransform.decrypt(req.body.hostUserId);
  var name = req.body.name;
  var closingAt = req.body.closingAt;

  req.models.User
    .findById(hostId)
    .then(function(user){
      if (user) {
        req.models.Order
          .create({
            "name": name,
            "closingAt": (closingAt ? new Date(closingAt) : null),
            "UserUserId": user.getDataValue('userId')
          })
          .then(function(order){
            res.json(order);
          });
      } else {
        // error
      }
    });
});

/**
 * To update an order's information
 */
router.post('/:id', function(req, res, next) {
  var orderId = idTransform.decrypt(req.params.id);

  var values = {};
  if (req.body.surcharge !== undefined) {
    values.surcharge = req.body.surcharge;
  }
  if (req.body.tax !== undefined) {
    values.tax = req.body.tax;
  }
  if (req.body.name) {
    values.name = req.body.name
  }
  if (req.body.closingAt) {
    values.closingAt = new Date(req.body.closingAt);
  }
  values.isOpen = req.body.isOpen;

  req.models.Order
    .update(
      values,
      {
        "where": {
          orderId: orderId
        }
      }
    )
    .then(function(result){
      var count = result[0];
      console.log(result);
      if (count === 1) {
        req.models.Order
          .find({
            "where": {
              orderId: orderId
            }
          })
          .then(function(order){
            req.wsUpdate(order.orderId, 'order', order);
            res.json(order);
          });
      } else {
        next();
      }
    });
});

/**
 * To fetch an order's items
 */
router.get('/:id/items', function(req, res, next) {
  var orderId = idTransform.decrypt(req.params.id);

  req.models.Item
    .findAll({
      "where": {
        OrderOrderId: orderId
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
  var orderId = idTransform.decrypt(req.params.id);
  var userId = idTransform.decrypt(req.body.user);
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
          "UserUserId": user.getDataValue('userId'),
          "OrderOrderId": order.getDataValue('orderId')
        })
        .then(function(item){
          req.models.Item
            .findAll({
              "where": {
                "OrderOrderId": orderId
              }
            })
            .then(function(items){
              req.wsUpdate(order.orderId, 'items', items);
            });
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
  var orderId = idTransform.decrypt(req.params.id);
  var itemId = req.params.itemId;

  req.models.Item
    .destroy({
      "where": {
        "itemId": itemId,
        "OrderOrderId": orderId
      }
    })
    .then(function() {
      req.models.Item
        .findAll({
          "where": {
            "OrderOrderId": orderId
          }
        })
        .then(function(items){
          req.wsUpdate(req.params.id, 'items', items);
        });
    });

  res.json({status: "200 OK"});
});

module.exports = router;
