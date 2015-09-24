require('angular');
require('./helpers/google-analytics');
require('angular-animate');
require('angular-messages');
require('angular-filter');
require('angular-websocket');
require('ionic-timepicker');
require('angular-clipboard');

var OrderController = require('./controllers/orderController');

// @ngInject
var app = angular.module('orderlyst', [
        'ionic',
        'ionic-timepicker',
        'ngAnimate',
        'ngMessages',
        'ngWebSocket',
        'angular.filter',
        'angular-clipboard',
        'analytics'
    ]);

require('./routes/index')(app);
require('./services/localStorage')(app);
require('./services/orderService')(app);
require('./directives/standardTimeNoMeridian')(app);

app.controller('JoinOrderController', OrderController.joinOrder).
    controller('CreateOrderController', OrderController.createOrder).
    controller('ViewOrderController', OrderController.viewOrder).
    controller('StartOrderController', OrderController.startOrder).
    // User authentication
    run(['$rootScope', '$store', function($rootScope, $store) {
        $store.bind($rootScope, '_orderlyst_uid', -1);
    }]);

module.exports = app;
