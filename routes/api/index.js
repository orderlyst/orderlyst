var express = require('express');
var router = express.Router();

var subrouters = [
  "/users"
];

subrouters.forEach(function(router){
  router.use(router, require('.' + router));
});

module.exports = router;
