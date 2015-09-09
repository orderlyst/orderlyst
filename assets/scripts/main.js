require('angular');
require('angular-animate');
require('angular-route');

var OrderController = require('./controllers/orderController.js');

// @ngInject
var app = angular.module('orderlyst', [
      'ngAnimate',
      'ngRoute'
    ]).
    controller('JoinOrderController', OrderController.joinOrder);

require('./routes/index')(app);

module.exports = app;