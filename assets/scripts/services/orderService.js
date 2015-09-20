module.exports = function(module) {
  'use strict';

  module.factory("$order", function ($websocket, $q, $rootScope) {

    var stream = $websocket('ws://localhost:8080/wsctrl');

    var orderId;
    var order;
    var items;
    var userDictionary = {};

    var callbacks = [];

    var fetchUserDetail = function (uid) {
      var deferred = $q.defer();
      if (userDictionary[uid] !== undefined) {
        deferred.reject();
        return deferred.promise;
      }
      $http.get('/api/users/' + uid)
        .success(function (data) {
          userDictionary[uid] = data;
          deferred.resolve(data);
        });
      return deferred.promise;
    };

    var fetchItems = function(orderId) {
      var deferred = $q.defer();
      var promises = [];
      $http.get('/api/orders/' + orderId + '/items')
        .success(function (data) {
          items = data;
          items.map(function(item) {
            promises.push(fetchUserDetail(item.UserUserId));
          });
        });

      $q.all(promises).then(function() {
        deferred.resolve(items);
      });
      return deferred.promise;
    };

    var fetchOrder = function(orderId) {
      var deferred = $q.defer();
      $http.get(
          '/api/orders/' + orderId
        )
        .then(function(data) {
          order = data;
          deferred.resolve();
        });
      return deferred.promise;
    };

    stream.onMessage(function(message) {
      if (message === 'update') {
        var promises = [];
        promises.push(fetchOrder(orderId));
        promises.push(fetchItems(orderId));
        $q.all(promises).then(function(){
          callbacks.forEach(function(callback) {
            if (callback) {
              callback();
            }
          });
        });
      }
    });

    var methods = {
      "register": function(oid) {
        console.log('Registering Order ' + oid);
        orderId = oid;
        stream.send(orderId);
      },
      "bind": function(callback) {
        if (callback) {
          callbacks.push(callback);
        }
      },
      "getOrder": function(){
        return order;
      },
      "getItems": function() {
        return items;
      },
      "getUser": function(uid) {
        return userDictionary[uid];
      },
      "reset": function() {
        callbacks = [];
      }
    };

    $rootScope.$on('$viewContentLoaded', methods.reset);

    return methods;
  });

};
