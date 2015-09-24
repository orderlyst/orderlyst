var express = require('express');
var router = express.Router();

router.get('/fbshareclose', function(req, res, next) {
  res.send('<html><script>window.close()</script></html>');
});

router.get('/join/:code', function(req, res, next){
  var code = req.params.code;
  var _order;

  req.models.Order
    .find({
      "where": {
        "code": code,
        "isOpen": true
      }
    })
    .then(function(order){
      if (order) {
        _order = order;
        console.log('loading meta');
        // render page with order
        return verifier.generate();
      } else {
        next();
      }
    })
    .then(function(token){
      res.render('meta', {
        order: _order,
        token: token
      });
    });
});

module.exports = router;
