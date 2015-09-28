var express = require('express');
var router = express.Router();
var verifier = require('./../middlewares/verifier');
var ua = require('ua-parser');
var idTransform = require('../middlewares/id-transform');

router.use('/api', verifier.middleware);
router.use('/api', require('./api/'));

// render partials for angular
router.get('/partials/:filename', function (req, res, next) {
  var filename = req.params.filename;

  if (!filename) {
    return next();
  }

  filename = filename.replace('-', '/').replace('..', '');
  res.render("partials/" + filename, {});
});

router.get('/open-whatsapp/:orderId', function(req, res, next) {
  var orderId = idTransform.decrypt(req.params.orderId);
  var r = ua.parse(req.headers['user-agent']);

  req.models.Order
    .find({
      "where": {
        "orderId": orderId,
        "isOpen": true
      }
    })
    .then(function(order){
      if (order) {
        //if (r.device.family === 'iPhone' || r.device.family === 'Android') {
          res.redirect(302, 'whatsapp://send?text=Order%20' + encodeURIComponent(order.name) + '%20with%20Orderlyst%20at%20http%3A%2F%2Forderlyst.this.sg%2Fjoin%2F' + order.code);
        //} else {
        //  res.redirect(302, 'https://web.whatsapp.com/');
        //}
      } else {
        next();
      }
    });
});

router.get('/fbshareclose', function(req, res, next) {
  res.send('<html><script>window.close()</script></html>');
});

router.get('/join/:code', function(req, res, next){
  var code = req.params.code;
  var _order;

  req.models.Order
    .find({
      "where": {
        "code": code
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
      if (_order) {
        res.render('meta', {
          order: _order,
          token: token
        });
      } else {
        next();
      }
    });
});


// catch all for loading angular page
router.all('/*', function (req, res) {
  verifier.generate().then(function(token){
    res.render('index', {
      title: 'Orderlyst',
      token: token
    });
  });
});

module.exports = router;
