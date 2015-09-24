var express = require('express');
var RateLimit = require('express-rate-limit');
var router = express.Router();

var subrouters = [
  "/users",
  "/orders"
];

// default options shown below
var limiter = RateLimit({
  windowMs: 120 * 1000,
  delayAfter: 10,
  delayMs: 500,
  max: 20
});

// for an API-only web app, you can apply this globally
router.use(limiter);

subrouters.forEach(function(route){
  router.use(route, require('.' + route));
});

module.exports = router;
