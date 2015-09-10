var models = require('../models/index');

var isDatabaseReady = false;
models.sequelize.sync().then(function(){
  isDatabaseReady = true;
});

module.exports = function(req, res, next) {
  if (isDatabaseReady) {
    req.models = models;
    next();
  } else {
    res.status(500);
    res.render('error', {
      message: "Orderlyst database not ready or connected.",
      error: {}
    });
  }
};
