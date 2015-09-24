var express = require('express');
var router = express.Router();
var verifier = require('./../middlewares/verifier');

router.use('/api', verifier.middleware);
router.use('/api', require('./api/'));
router.use('/', require('./orders/'));

// render partials for angular
router.get('/partials/:filename', function (req, res, next) {
  var filename = req.params.filename;

  if (!filename) {
    return next();
  }

  filename = filename.replace('-', '/').replace('..', '');
  res.render("partials/" + filename, {});
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
