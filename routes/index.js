var express = require('express');
var router = express.Router();

router.use('/api/*', require('./api/index'));

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
  res.render('index', {title: 'Orderlyst'});
});

module.exports = router;
