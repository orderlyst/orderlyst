var express = require('express');
var router = express.Router();
var verifier = require('./../middlewares/verifier');

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
