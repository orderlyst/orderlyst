require('angular');
require('angular-animate');
require('angular-route');
require('ngStorage');

var OrderController = require('./controllers/orderController');

// @ngInject
var app = angular.module('orderlyst', [
      'ngAnimate',
      'ngRoute'
    ]).
    controller('JoinOrderController', OrderController.joinOrder).
    controller('CreateOrderController', OrderController.createOrder).
    controller('ViewOrderController', OrderController.viewOrder);

require('./routes/index')(app);
require('./services/localStorage')(app);

module.exports = app;