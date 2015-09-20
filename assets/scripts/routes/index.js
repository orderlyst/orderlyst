module.exports = function(app) {
  "use strict";

  app.config(
    [
      '$stateProvider',
      '$urlRouterProvider',
      '$locationProvider',
      '$httpProvider',
      function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
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
                url: "/join",
                templateUrl: "/partials/join",
                controller: "JoinOrderController"
            }
            ).state('joinOrder', {
                url: "/join/:orderCode",
                templateUrl: "/partials/join",
                controller: "JoinOrderController"
            }
            ).state('create', {
                url: "/create",
                templateUrl: "/partials/create",
                controller: "CreateOrderController"
            }
            ).state('view', {
                url: "/orders/:orderId?new",
                controller: "ViewOrderController",
                templateUrl: "/partials/view",
                resolve: {
                    loadOrder:  function($http, $stateParams){
                        return $http.get(
                            '/api/orders/' + $stateParams.orderId
                        );
                    }
                }
            }
        );

        $urlRouterProvider.otherwise('/');
      }
    ]
  );
};
