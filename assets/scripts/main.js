require('angular');
require('angular-animate');
require('angular-filter');

var OrderController = require('./controllers/orderController');
var NavBarController = require('./controllers/navbarController');

// @ngInject
var app = angular.module('orderlyst', [
      'ionic',
      'ngAnimate',
      'angular.filter'
    ]);

require('./routes/index')(app);
require('./services/localStorage')(app);

app.controller('JoinOrderController', OrderController.joinOrder).
    controller('CreateOrderController', OrderController.createOrder).
    controller('ViewOrderController', OrderController.viewOrder).
    controller('StartOrderController', OrderController.startOrder).
    controller('NavBarController', NavBarController).
    // User authentication
    run(['$rootScope', '$store', function($rootScope, $store) {
        $store.bind($rootScope, '_orderlyst_uid', -1);
    }]);

module.exports = app;