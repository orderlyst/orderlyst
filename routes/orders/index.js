var express = require('express');
var router = express.Router();

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
          // render page with order
        } else {
          next();
        }
      });
  } else {
    next();
  }
});

module.exports = router;
