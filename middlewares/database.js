var mongoose = require('mongoose');
var config = require('config');

var isConnected = false;
var connect = function () {
  isConnected = false;
  var options = { server: { socketOptions: { keepAlive: 1 } } };
  mongoose.connect(config.mongodb, options);
};
connect();
mongoose.connection.on('error', console.log);
mongoose.connection.on('disconnected', connect);
mongoose.connection.once('open', function() {
  isConnected = true;
  console.info('Connected to database');
});


if (process.env.NODE_ENV === 'test') {
  var mockgoose = require('mockgoose');
  mockgoose(mongoose);
}

module.exports = function(req, res, next) {
  if (isConnected) {
    req.db = mongoose;
    next();
  } else {
    res.status(500);
    res.render('error', {
      message: "Orderlyst database not ready or connected.",
      error: {}
    });
  }
};
