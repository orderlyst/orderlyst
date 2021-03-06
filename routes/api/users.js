var express = require('express');
var router = express.Router();
var idTransform = require('../../middlewares/id-transform');

/**
 * To fetch a user's information
 */
router.get('/:id', function(req, res, next) {
  var userId = idTransform.decrypt(req.params.id);

  req.models.User
    .find({
      where: {
        userId: userId
      }
    })
    .then(function(user){
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({
          "status": "404 Not Found"
        });
      }
    });
});

/**
 * To create a new user
 */
router.post('/', function(req, res, next) {
  var name = req.body.name;
  req.models.User
    .create({
      "name": name
    })
    .then(function(user){
      res.json(user);
    });
});

/**
 * To update an existing user
 */
router.post('/:id', function(req, res, next) {
  var name = req.body.name;
  var userId = idTransform.decrypt(req.params.id);

  var notifyWSClients = function(userId, user) {
    req.models.Item
      .findAll({
        "where": {
          UserUserId: userId
        },
        group: ['OrderOrderId']
      })
      .then(function(items){
        items.forEach(function(item){
          req.wsUpdate(item.OrderOrderId, 'user', user);
        });
      });
    req.models.Order
      .findAll({
        "where": {
          UserUserId: userId,
          isOpen: true
        }
      })
      .then(function(orders){
        orders.forEach(function(order){
          req.wsUpdate(order.orderId, 'user', user);
        });
      });
  };

  req.models.User
    .update(
      {
        "name": name
      },
      {
        where: {
          userId: userId
        }
      }
    )
    .then(function(user){
      if (user) {
        req.models.User
          .findOne({
            "where":{
              userId: userId
            }
          })
          .then(function(user){
            notifyWSClients(userId, user);
            res.json(user);
          });
      } else {
        res.status(404).json({
          "status": "404 Not Found"
        });
      }
    });
});

module.exports = router;
