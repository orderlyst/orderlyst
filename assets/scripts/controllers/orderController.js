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


var joinOrder = ['$scope', '$http', '$location', '$store', '$stateParams', '$q', '$ionicModal',
    function($scope, $http, $location, $store, $stateParams, $q, $ionicModal) {
    $scope.joinOrder = {};
    $scope.submitted = false;
    $scope.joinOrder.code = $stateParams.orderCode;
    var uid = $store.get('_orderlyst_uid');
    $scope.hasAccount = (uid !== -1);
    $scope.codeNotAvailable = false;

    if ($scope.hasAccount) {
      $scope.joinOrder.name = uid;
    }

    $scope.submit = function(form) {
        $scope.submitted = true;
        if (form.$valid) {
          var promises = [];

          promises.push($http.post(
            '/api/orders/search',
            {
              code: $scope.joinOrder.code
            }
          ));

          if (!$scope.hasAccount) {
            console.log('creating user');
            promises.push($http.post(
                '/api/users',
                {
                  name: $scope.joinOrder.name
                }
            ));
          }

          $q.all(promises).then(function(result){
            var order = result[0].data;
            if (result[1]) {
              // user created
              $scope.hasAccount = true;
              var user = result[1].data;
              $store.set('_orderlyst_uid', user.userId);
            }
            if (order) {
              $location.url('/orders/' + order.orderId);
            } else {
              // order is not found or no longer available.
              $scope.codeNotAvailable = true;
            }
          });
        }
    };
}];

var createOrder = ['$scope', '$http', '$location', '$store',
    function($scope, $http, $location, $store) {
    $scope.createOrder = {};
    $scope.submitted = false;
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
        $scope.submitted = true;
        if (name === undefined) return;
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
    'loadOrder', '$ionicTabsDelegate', '$timeout', '$ionicModal', '$ionicPopup', '$ionicActionSheet', '$q',
    function ($scope, $http, $stateParams, $store, $location, loadOrder,
              $ionicTabsDelegate, $timeout, $ionicModal, $ionicPopup, $ionicActionSheet, $) {
    // Firstly check if order exists
    if (loadOrder.data === null) {
        // Redirect to home in this case
        $location.url('/');
    } else {
        $scope.order = loadOrder.data;
    }

    // Setup new order item modal form
    $ionicModal.fromTemplateUrl('/partials/new', function(modal) {
        $scope.addItemModal = modal;
    }, {
        scope: $scope,
        animation: 'slide-in-up',
        hardwareBackButtonClose: false
    });

    $scope.showLockOrderPopup = function() {

      var popup = $ionicPopup.show({
        template: "Are you sure that you want to lock the order? " +
          "After you lock the order, people will not be able to add more item tothe order.",
        title: "Lock Order",
        scope: $scope,
        buttons: [
          {text: 'Cancel'},
          {
            text: "Confirm" ,
            type: "button-filled",
            onTap: function(e) {
              $scope.toggleLocked();
            }
          }
        ]
      });
    };

    $scope.openAddItemModal = function() {
        $scope.addItemModal.show();
    };

    $scope.closeAddItemModal = function() {
        $scope.addItemModal.hide();
    };


    // Setup additional fee modal form

    $ionicModal.fromTemplateUrl('/partials/extraFee', function(modal) {
        $scope.additionalFeeModal = modal;
    }, {
        scope: $scope,
        animation: 'slide-in-up',
        hardwareBackButtonClose: false
    });

    $scope.openAdditionalFeeModal = function() {
        $scope.additionalFeeModal.show();
    };

    $scope.closeAdditionalFeeModal = function() {
        $scope.additionalFeeModal.hide();
    };

    $scope.$on('$destroy', function() {
        $scope.addItemModal.remove();
        $scope.additionalFeeModal.remove();
    });



    $scope.showActionSheet = function(){
     var sheet = $ionicActionSheet.show({
       buttons: [
         { text: '<i class="icon ion-ios-copy-outline"></i> Copy Link' }
       ],
       titleText: "Order Code: " + $scope.order.code,
       cancelText: 'Cancel',
       cancel: function() {
         sheet();
       },
       buttonClicked: function(index) {
         return true;
       }
     });
    };

    $scope.uid              = $store.get('_orderlyst_uid');
    var hasAccount       = ($scope.uid !== -1);
    $scope.isLoading = true;
    $scope.scrolling = false;
    $scope.isOwner = $scope.uid === $scope.order.UserUserId;
    $scope.orderFormData = {};
    $scope.itemFormData = {'user': $scope.uid, 'quantity': 1, 'submitted': false};
    $scope.additionalFee = { 'surcharge': $scope.order.surcharge, 'tax': $scope.order.tax, 'submitted': false};
    $scope.userDictionary = {};
    $scope.items = [];

    // For showing new item added message
    var notify = function(message, type) {
        $scope.alertOn = true;
        $scope.alertMessage = message;
        $scope.alertType = type;
        $timeout(function() {
            $scope.alertOn = false;
        }, 1000);
    };

    // Get user details method
    var fetchUserDetail = function (uid) {
        if ($scope.userDictionary[uid] !== undefined) return;
        $http.get('/api/users/' + uid)
            .success(function (data) {
                $scope.userDictionary[uid] = data;
            });
    };

    // Authenticate user
    fetchUserDetail($scope.uid);
    if (!hasAccount) {
        $location.url('/join/' + $scope.order.code);
    }

    // To check if user has any order items
    $scope.hasOrderItems = function() {
        return ($scope.items.filter(function(i) {
            return i.UserUserId == $scope.uid;
        }).length > 0);
    };

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
        if ($scope.itemFormData.quantity < 1) {
          $scope.itemFormData.quantity = 1;
        } else {
          console.log('add one');
          $scope.itemFormData.quantity++;
        }
    };

    $scope.decrementFormDataQuantity = function() {
        // Cast the quantity to numeric first
        $scope.itemFormData.quantity = +$scope.itemFormData.quantity;
        if ($scope.itemFormData.quantity > 1) {
          console.log('sub one');
          $scope.itemFormData.quantity--;
        } else {
          $scope.itemFormData.quantity = 1;
        }
    };
    $scope.createAdHocOrderItem = function(name, price) {
        $scope.isLoading = true;
        $http.post(
            '/api/orders/' + $scope.order.orderId + '/items',
            {name:name, price:price, user:$scope.uid}
        ).success(function (data) {
            $scope.isLoading = false;
            $scope.items.push(data);
            $scope.newItemAdded = true;
            $scope.alertMessage = "New item added";
                notify(pluralize(1, name) + ' added', 'success');
        });
    };
    $scope.createOrderItem = function() {
        // HACK
        $scope.itemFormData.submitted = true;
        var orderItemData = angular.copy($scope.itemFormData);
        if (orderItemData.name === '' || orderItemData.name === undefined ||
            orderItemData.price === '' || orderItemData.price === undefined ||
            !(/^[1-9][0-9]*(\.[0-9][05])?$/.test(orderItemData.price)) ||
            +orderItemData.quantity < 1) return;
        $scope.isLoading = true;
        // Hide modal
        $scope.closeAddItemModal();
        // Clear formData
        $scope.itemFormData.submitted = false;
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
        notify(pluralize(orderItemData.quantity, orderItemData.name) + ' added', 'success');
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
                notify(pluralize(1, item.name) + ' removed', 'warning');
            });
    };

    // Aditional Fees scope methods

    $scope.updateOrderAdditionalFee = function() {
        var fees = $scope.additionalFee;
        fees.submitted = true;
        if (fees.surcharge === '' || fees.surcharge === undefined ||
            fees.tax === '' || fees.surcharge === undefined ||
            !(/^[0-9]+(\.[0-9][05])?$/.test(fees.surcharge)) ||
            !(/^[0-9]+(\.[0-9]+)?$/.test(fees.tax)) ) return;
        $scope.isLoading = true;
        // Hide modal
        $scope.closeAdditionalFeeModal();
        fees.submitted = false;
        $http.post(
            '/api/orders/' + $scope.order.orderId,
            fees
        ).success(function(data) {
            $scope.isLoading = false;
            $scope.order = data;
        });
    };

    // Fee aggregate scope methods

    $scope.subtotalFee = function() {
        return $scope.items.reduce(function(a, b) {
            return a + parseFloat(b.price);
        }, 0);
    };

    $scope.totalFee = function() {
        return ($scope.subtotalFee() + $scope.order.surcharge) * (1 + $scope.order.tax / 100);
    };

    // To toggle isOpen status of order

    $scope.toggleLocked = function() {
      $scope.order.isOpen = !$scope.order.isOpen;
      $http.post(
          '/api/orders/' + $scope.order.orderId,
          $scope.order
      ).success(function(data) {
      });
    };

    // For scrolling
    $scope.scrollingPromises = [];

    var clearScrollingPromises = function() {
        $scope.scrollingPromises.map(function(promise) {
            $timeout.cancel(promise);
        });
        $scope.scrollingPromises = [];
    };

    $scope.scroll = function() {
        clearScrollingPromises();
        var p = $timeout(function () {
            $scope.scrolling = true;
            // In case scrollb timeout get cleared first
            var p2 = $timeout(function () {
                $scope.scrolling = false;
            }, 800);
            $scope.scrollingPromises.push(p2);
        }, 0);
        $scope.scrollingPromises.push(p);
    };

    $scope.scrollb = function() {
        clearScrollingPromises();
        var p = $timeout(function () {
            $scope.scrolling = false;
        }, 0);
        $scope.scrollingPromises.push(p);
    };
}];


module.exports = {
    startOrder: startOrder,
    joinOrder: joinOrder,
    createOrder: createOrder,
    viewOrder: viewOrder
};
