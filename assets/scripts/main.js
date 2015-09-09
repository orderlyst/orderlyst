require('angular');
require('angular-animate');
require('angular-route');

var OrderController = require('./controllers/orderController');

// @ngInject
var app = angular.module('orderlyst', [
      'ngAnimate',
      'ngRoute'
    ]).
    controller('JoinOrderController', OrderController.joinOrder).
    controller('CreateOrderController', OrderController.createOrder);

require('./routes/index')(app);

module.exports = app;