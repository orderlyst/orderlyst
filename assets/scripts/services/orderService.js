module.exports = function(module) {
  'use strict';

  module.factory("$order", function ($websocket, $q, $rootScope, $http, $window, $store, $location) {

    var stream = $websocket('ws://' + $location.host() + ':8080/wsctrl');

    var $currentScope;
    var orderId;

    var createUserKey = function(uid) {
      return '_orderlyst_users_' + uid;
    };

    var createOrderItemsKey = function(orderId) {
      return '_orderlyst_orders_' + orderId + '_items';
    };

    var createItemsKey = function(itemId) {
      return '_orderlyst_items_' + itemId;
    };

    var createOrderKey = function(orderId) {
      return '_orderlyst_orders_' + orderId;
    };

    var fetchUser = function (uid) {
      var deferred = $q.defer();
      if ($window.navigator.onLine) {
        $http
          .get('/api/users/' + encodeURIComponent(uid))
          .then(function (response) {
            $currentScope.userDictionary[uid] = response.data;
            $store.set(createUserKey(uid), response.data);
            deferred.resolve(response.data);
          }, function(response) {
            deferred.reject(response);
          });
      } else {
        $currentScope.userDictionary[uid] = $store.get(createUserKey(uid));
        deferred.resolve($currentScope.userDictionary[uid]);
      }
      return deferred.promise;
    };

    var fetchItems = function(orderId) {
      var deferred = $q.defer();
      if ($window.navigator.onLine) {
        $http
          .get('/api/orders/' + encodeURIComponent(orderId) + '/items')
          .then(function (response) {
            $currentScope.items = Array.prototype.slice.call(response.data, 0);
            var idArray = $currentScope.items.map(function(item) {
              return item.itemId;
            });
            $store.set(createOrderItemsKey(orderId), idArray);
            $currentScope.items.map(function(item) {
              $store.set(createItemsKey(item.itemId), item);
            });
            deferred.resolve($currentScope.items);
          }, function(response) {
            deferred.reject(response);
          });
      } else {
        var idArray = $store.get(createOrderItemsKey(orderId));
        $currentScope.items = idArray.map(function(itemId) {
          return $store.get(createItemsKey(itemId));
        });
        deferred.resolve($currentScope.items);
      }
      return deferred.promise;
    };

    var fetchOrder = function(orderId) {
      var deferred = $q.defer();

      if ($window.navigator.onLine) {
        $http
          .get(
            '/api/orders/' + encodeURIComponent(orderId)
          )
          .then(function(response) {
            $currentScope.order = response.data;
            $store.set(createOrderKey(orderId), response.data);
            deferred.resolve($currentScope.order);
          }, function (response) {
            deferred.reject(response);
          });
      } else {
        $currentScope.order = $store.get(createOrderKey(orderId));
        deferred.resolve($currentScope.order);
      }
      return deferred.promise;
    };

    stream.onMessage(function(response) {
      var message = JSON.parse(response.data);
      console.log(message);
      var data = message.data;
      if (message.type === 'user') {
        $currentScope.userDictionary[data.userId] = data;
      } else if (message.type === 'items') {
        $currentScope.items = data;
      } else if (message.type === 'order') {
        $currentScope.order = data;
      }
    });

    var methods = {
      "register": function(oid) {
        console.log('Registering Order ' + oid);
        orderId = oid;
        stream.send(orderId);
      },
      "setScope": function(scope) {
        $currentScope = scope;
        $currentScope.items = [];
        $currentScope.userDictionary = {};
        $currentScope.order = null;
      },
      "getOrder": function(){
        var deferred = $q.defer();
        if ($currentScope.order) {
          deferred.resolve($currentScope.order);
        } else {
          fetchOrder(orderId).then(function() {
            deferred.resolve($currentScope.order);
          }, function(response) {
            deferred.reject(response);
          });
        }
        return deferred.promise;
      },
      "getItems": function() {
        var deferred = $q.defer();
        if ($currentScope.items.length > 0) {
          deferred.resolve($currentScope.items);
        } else {
          fetchItems(orderId).then(function(){
            deferred.resolve($currentScope.items);
          }, function(response) {
            deferred.reject(response);
          });
        }
        return deferred.promise;
      },
      "getUser": function(uid) {
        var deferred = $q.defer();
        if ($currentScope.userDictionary[uid]) {
          deferred.resolve($currentScope.userDictionary[uid]);
        } else {
          fetchUser(uid).then(function(){
            deferred.resolve($currentScope.userDictionary[uid]);
          }, function(response) {
            deferred.reject(response);
          });
        }
        return deferred.promise;
      }
    };

    return methods;
  });

};
