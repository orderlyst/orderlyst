require('angular');
require('angular-animate');
require('angular-route');

// @ngInject
var app = angular.module('orderlyst', [
  'ngAnimate',
  'ngRoute'
]);

require('./routes/index')(app);

module.exports = app;