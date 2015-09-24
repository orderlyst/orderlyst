var crypto = require('crypto');
var Q = require('q');
var tokens = {};

setInterval(function() {
  for(var token in tokens) {
    if (tokens[token].getTime() < Date.now()) {
      delete tokens[token];
    }
  }
}, 86400);

module.exports = {
  "generate": function() {
    var deferred = Q.defer();
    crypto.randomBytes(64, function(ex, buf) {
      var token = buf.toString('hex');
      tokens[token] = new Date(Date.now() + 86400000); // 24-hour expiry
      deferred.resolve(token);
    });
    return deferred.promise;
  },
  "middleware": function(req, res, next) {
    var token = req.headers["x-access-token"];
    if (!tokens[token] || tokens[token].getTime() < Date.now()) {
      res.status(401).json({'error': 'access denied.'});
    } else {
      next();
    }
  }
};
