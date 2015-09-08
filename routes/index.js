var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/api/*', require('./api/index'));

// render partials for angular
router.get('/partials/:filename', function (req, res, next) {
  var filename = req.params.filename,
      locals;

  if (!filename) {
    return next();
  }

  if (req.session.passport) {
    locals = {user: req.session.passport.user};
  }

  filename = filename.replace('-', '/').replace('..', '');
  res.render("partials/" + filename, locals);
});

// catch all for loading angular page
router.all('/*', function (req, res) {
  res.render('index', {title: 'Kardboard'});
});


module.exports = router;
