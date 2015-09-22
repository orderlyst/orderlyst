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
      res.json(user);
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
            userId: user.userId
          })
          .then(function(user){
            req.models.Item
              .findAll({
                UserUserId: user.userId,
                group: ['OrderOrderId']
              })
              .then(function(items){
                items.forEach(function(item){
                  req.wsUpdate(item.OrderOrderId, 'user', user);
                });
              });
            req.models.Order
              .findAll({
                UserUserId: user.userId
              })
              .then(function(orders){
                orders.forEach(function(order){
                  req.wsUpdate(order.orderId, 'user', user);
                })
              })
            res.json(user);
          });
      }
    });
});

module.exports = router;
