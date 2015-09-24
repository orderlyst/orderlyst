var express = require('express');
var RateLimit = require('express-rate-limit');
var router = express.Router();

var subrouters = [
  "/users",
  "/orders"
];

// default options shown below
var limiter = RateLimit({
  windowMs: 60 * 1000,
  delayAfter: 50,
  delayMs: 500,
  max: 100
});

// for an API-only web app, you can apply this globally
router.use(limiter);

subrouters.forEach(function(route){
  router.use(route, require('.' + route));
});

module.exports = router;
