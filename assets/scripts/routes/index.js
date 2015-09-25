module.exports = function(app) {
  "use strict";

  app.config(
    [
      '$stateProvider',
      '$urlRouterProvider',
      '$locationProvider',
      function($stateProvider, $urlRouterProvider, $locationProvider) {
        $locationProvider.html5Mode({
          "enabled": true
        });

        $stateProvider
            .state('index', {
                url: '/',
                templateUrl: "/partials/index",
                controller: "StartOrderController"
            }
            ).state('join', {
                cache: false,
                url: "/join",
                templateUrl: "/partials/join",
                controller: "JoinOrderController"
            }
            ).state('joinOrder', {
                cache: false,
                url: "/join/:orderCode",
                templateUrl: "/partials/join",
                controller: "JoinOrderController"
            }
            ).state('create', {
                cache: false,
                url: "/create",
                templateUrl: "/partials/create",
                controller: "CreateOrderController"
            }
            ).state('view', {
                cache: false,
                url: "/orders/:orderId?new",
                controller: "ViewOrderController",
                templateUrl: "/partials/view"
            }
        );

        $urlRouterProvider.otherwise('/');
      }
    ]
  );
};
