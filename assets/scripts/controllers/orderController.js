var pluralize = require('../helpers/pluralize.js');

var startOrder = ['$scope', '$http', '$location', '$store',
    function($scope, $http, $location, $store) {
    var uid = $store.get('_orderlyst_uid');
    var hasAccount = (uid !== -1);
    $scope.createOrder = function() {
        if (hasAccount) {
            $http.post(
                '/api/orders',
                {
                  hostUserId: uid
                }
            ).success(function (data) {
                $location.url('/orders/' + data.orderId);
            });
        } else {
            $location.url('/create');
        }
    };
}];


var joinOrder = ['$scope', '$http', '$location', '$store', '$stateParams', '$q',
    function($scope, $http, $location, $store, $stateParams, $q) {
    $scope.joinOrder = {};
    $scope.joinOrder.code = $stateParams.orderCode;
    var uid = $store.get('_orderlyst_uid');
    $scope.hasAccount = (uid !== -1);
    $scope.submit = function() {
        var name, orderCode;
        if ($scope.hasAccount) {
            name = uid;
        } else {
            name = $scope.joinOrder.name;
        }
        orderCode = $scope.joinOrder.code;
        if (name === "" || orderCode === "") return;
        var promises = [];

        promises.push($http.post(
          '/api/orders/search',
          {
            code: orderCode
          }
        ));

        if (!$scope.hasAccount) {
            //$location.url('/orders/' + orderCode);
          console.log('creating user');
          promises.push($http.post(
              '/api/users',
              {
                name: name
              }
          ));
        }

        $q.all(promises).then(function(result){
          var order = result[0].data;
          if (result[1]) {
            // user created
            var user = result[1].data;
            $store.set('_orderlyst_uid', user.userId);
          }
          $location.url('/orders/' + order.orderId);
        });
    };
}];

var createOrder = ['$scope', '$http', '$location', '$store',
    function($scope, $http, $location, $store) {
    $scope.createOrder = {};
    var uid = $store.get('_orderlyst_uid');
    var hasAccount = (uid !== -1);
    if (hasAccount) {
        $http.post(
            '/api/orders',
            {
              hostUserId: uid
            }
        ).success(function (data) {
            $location.url('/orders/' + data.orderId);
        });
    }
    $scope.submit = function() {
        var name = $scope.createOrder.name;
        if (name === "") return;
        // First create user and go to order page
        if (hasAccount) {
            $http.post(
                '/api/orders',
                {
                  hostUserId: uid
                }
            ).success(function (data) {
                $location.url('/orders/' + data.orderId);
            });
        } else {
            $http.post(
                '/api/users',
                {
                  name: name
                }
            ).then(function (response) {
                // Save uid in local storage
                $store.set('_orderlyst_uid', response.data.userId);
                return $http.post(
                  '/api/orders',
                  {
                    hostUserId: response.data.userId
                  }
                );
            }).then(function (response) {
              $location.url('/orders/' + response.data.orderId);
            });
        }
    };
}];

var viewOrder = ['$scope', '$http', '$stateParams', '$store', '$location',
    'loadOrder', '$ionicTabsDelegate', '$timeout', '$ionicModal',
    function ($scope, $http, $stateParams, $store, $location, loadOrder,
              $ionicTabsDelegate, $timeout, $ionicModal) {
    // Firstly check if order exists
    if (loadOrder.data === null) {
        // Redirect to home in this case
        $location.url('/');
    } else {
        $scope.order = loadOrder.data;
    }

    // Setup new order item modal form
    $ionicModal.fromTemplateUrl('/partials/new', function(modal) {
        $scope.modal = modal;
    }, {
        scope: $scope,
        animation: 'slide-in-up',
        hardwareBackButtonClose: false
    });

    $scope.openModal = function() {
        $scope.modal.show();
    };

    $scope.closeModal = function() {
        $scope.modal.hide();
    };

    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });

    var uid              = $store.get('_orderlyst_uid');
    var hasAccount       = (uid !== -1);
    $scope.isLoading = true;
    $scope.isOwner = uid === $scope.order.UserUserId;
    $scope.orderFormData = {};
    $scope.itemFormData = {'user': uid, 'quantity': 1};
    $scope.userDictionary = {};
    $scope.items = [];

    // For showing new item added message
    var notifyItemAdded = function(message) {
        $scope.newItemAdded = true;
        $scope.alertMessage = message;
        $timeout(function() {
            $scope.newItemAdded = false;
        }, 1000);
    }

    // Get user details method
    var fetchUserDetail = function (uid) {
        if ($scope.userDictionary[uid] !== undefined) return;
        $http.get('/api/users/' + uid)
            .success(function (data) {
                $scope.userDictionary[uid] = data;
            });
    };

    // Authenticate user
    fetchUserDetail(uid);
    if (!hasAccount) {
        $location.url('/join/' + $scope.order.code);
    }

    // Fetch order item
    $http.get('/api/orders/' + $scope.order.orderId + '/items')
    .success(function (data) {
        $scope.isLoading = false;
        $scope.items = data;
        $scope.items.map(function(datum) {
            fetchUserDetail(datum.UserUserId);
        });
    });

    // Item Form scope methods
    $scope.incrementFormDataQuantity = function() {
        // Cast the quantity to numeric first
        $scope.itemFormData.quantity = +$scope.itemFormData.quantity;
        if ($scope.itemFormData.quantity < 1) $scope.itemFormData.quantity = 1;
        else $scope.itemFormData.quantity++;
    };

    $scope.decrementFormDataQuantity = function() {
        // Cast the quantity to numeric first
        $scope.itemFormData.quantity = +$scope.itemFormData.quantity;
        if ($scope.itemFormData.quantity > 1) $scope.itemFormData.quantity--;
        else $scope.itemFormData.quantity = 1;
    };
    $scope.createAdHocOrderItem = function(name, price) {
        $scope.isLoading = true;
        $http.post(
            '/api/orders/' + $scope.order.orderId + '/items',
            {name:name, price:price, user:uid}
        ).success(function (data) {
            $scope.isLoading = false;
            $scope.items.push(data);
            $scope.newItemAdded = true;
            $scope.alertMessage = "New item added";
            notifyItemAdded(pluralize(1, name) + ' added');
        });
    };
    $scope.createOrderItem = function() {
        var orderItemData = angular.copy($scope.itemFormData);
        if (orderItemData.name === '' ||
            orderItemData.price === '' ||
            isNaN(+orderItemData.price ||
            +orderItemData.quantity < 1)) return;
        $scope.isLoading = true;
        // Hide modal
        $scope.modal.hide();
        // Clear formData
        $scope.itemFormData.name = '';
        $scope.itemFormData.price = '';
        $scope.itemFormData.quantity = 1;
        // Add items quantity times
        for (var i = 0; i < orderItemData.quantity; i++) {
            $http.post(
                '/api/orders/' + $scope.order.orderId + '/items',
                orderItemData
            ).success(function (data) {
                $scope.isLoading = false;
                $scope.items.push(data);
            });
        }
        notifyItemAdded(pluralize(orderItemData.quantity, orderItemData.name) + ' added');
    };
    $scope.removeOrderItem = function(item) {
        $scope.isLoading = true;
        $http.delete(
            '/api/orders/' + $scope.order.orderId + '/items/' + item.itemId
        ).success(function(data) {
                $scope.isLoading = false;
                $scope.items = $scope.items.filter(function(i) {
                    return i.itemId !== item.itemId;
                });
            });
    };
    $scope.totalFee = function() {
        return $scope.items.reduce(function(a, b) {
            return a + parseFloat(b.price);
        }, 0);
    };
}];


module.exports = {
    startOrder: startOrder,
    joinOrder: joinOrder,
    createOrder: createOrder,
    viewOrder: viewOrder
};
