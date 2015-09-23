var express = require('express');
var router = express.Router();

router.get('/fbshareclose', function(req, res, next) {
  res.send('<html><script>window.close()</script></html>');
});

router.get('/join/:code', function(req, res, next){
  var code = req.params.code;
  var r = require('ua-parser').parse(req.headers['user-agent']);

  var isFacebookBot = (r.ua.family === 'FacebookBot');
  if (isFacebookBot) {
    req.models.Order
      .find({
        "where": {
          "code": code,
          "isOpen": true
        }
      })
      .then(function(order){
        if (order) {
          console.log('loading meta');
          // render page with order
          res.render('meta', {
            order: order
          });
        } else {
          next();
        }
      });
  } else {
    next();
  }
});

module.exports = router;
