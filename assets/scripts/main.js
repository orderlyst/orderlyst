require('angular');
require('angular-animate');
require('angular-route');

// @ngInject
var app = angular.module('orderlyst', [
  'ngAnimate',
  'ngRoute',
]);

app.config(
    [
      '$routeProvider',
      '$locationProvider',
      '$httpProvider',
      function($routeProvider, $locationProvider, $httpProvider) {
        $locationProvider.html5Mode({
          "enabled": true
        });

        $routeProvider
          .when(
            "/",
            {
              templateUrl: "/partials/index"
            }
          );

        $routeProvider.otherwise({ redirectTo: "/" });
      }
    ]
  );

module.exports = app;