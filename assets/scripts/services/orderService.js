module.exports = function(module) {
  'use strict';

  module.factory("$order", function ($websocket, $q, $rootScope) {

    var stream = $websocket('ws://localhost:8080/wsctrl');

    var orderId;
    var order;
    var items;
    var userDictionary = {};

    var fetchUser = function (uid) {
      var deferred = $q.defer();
      $http.get('/api/users/' + encodeURIComponent(uid))
        .then(function (response) {
          userDictionary[uid] = response.data;
          deferred.resolve(response.data);
        });
      return deferred.promise;
    };

    var fetchItems = function(orderId) {
      var deferred = $q.defer();
      var promises = [];
      $http.get('/api/orders/' + encodeURIComponent(orderId) + '/items')
        .then(function (response) {
          items = response.data;
          items = Array.prototype.slice.call(items, 0);
          items.map(function(item) {
            promises.push(fetchUser(item.UserUserId));
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
        .then(function(response) {
          order = response.data;
          deferred.resolve(order);
        });
      return deferred.promise;
    };

    stream.onMessage(function(message) {
      var oMessage = JSON.parse(message);
      var data = oMessage.data;
      if (oMessage.type === 'user') {
        userDictionary[data.userId] = data;
      } else if (oMessage.type === 'items') {
        items = data;
      } else if (oMessage.type === 'order') {
        order = data;
      }
    });

    var methods = {
      "register": function(oid) {
        console.log('Registering Order ' + oid);
        orderId = oid;
        stream.send(orderId);
      },
      "getOrder": function(callback){
        if (order) {
          callback(order);
        } else {
          fetchOrder(orderId).then(function() {
            callback(order);
          });
        }
      },
      "getItems": function(callback) {
        if (items) {
          callback(items);
        } else {
          fetchItems(orderId).then(function(){
            callback(items);
          });
        }
      },
      "getUser": function(uid, callback) {
        if (userDictionary[uid]) {
          callback(userDictionary[uid]);
        } else {
          fetchUser(uid).then(function(){
            callback(userDictionary[uid]);
          });
        }
      }
    };

    return methods;
  });

};
