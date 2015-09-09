module.exports = function(app) {
  "use strict";

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
          ).when(
            "/join",
            {
              templateUrl: "/partials/join",
              controller: "JoinOrderController"
            }
          ).when(
            "/create",
            {
              templateUrl: "/partials/create",
              controller: "CreateOrderController"
            }
          );

        $routeProvider.otherwise({ redirectTo: "/" });
      }
    ]
  );
};
