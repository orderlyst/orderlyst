require('angular');
require('angular-animate');
require('angular-route');

var OrderController = require('./controllers/orderController');

// @ngInject
var app = angular.module('orderlyst', [
      'ngAnimate',
      'ngRoute'
    ]);

require('./routes/index')(app);
require('./services/localStorage')(app);

app.controller('JoinOrderController', OrderController.joinOrder).
    controller('CreateOrderController', OrderController.createOrder).
    controller('ViewOrderController', OrderController.viewOrder).
    // User authentication
    run(['$rootScope', '$store', function($rootScope, $store) {
        $store.bind($rootScope, '_uid', -1);
    }]);

module.exports = app;