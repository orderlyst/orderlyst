var express = require('express');
var router = express.Router();
var OrderModel = require('../../models/order');

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


module.exports = router;
