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
        .then(function(data) {
          order = data;
          deferred.resolve(data);
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
