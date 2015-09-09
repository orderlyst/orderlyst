var express = require('express');
var router = express.Router();

var subrouters = [
  "/users",
  "/orders"
];

subrouters.forEach(function(route){
  router.use(route, require('.' + route));
});

module.exports = router;
