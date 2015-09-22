var pluralize = require('../helpers/pluralize.js');

var startOrder = ['$scope', '$http', '$window', '$store', '$location', '$order',
    function($scope, $http, $window, $store, $location, $order) {
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
              $order.register(data.orderId);
              $window.location.href = '/orders/' + encodeURIComponent(data.orderId) + '?new=true';
            });
        } else {
            $location.url('/create');
        }
    };
}];

var joinOrder = ['$scope', '$http', '$location', '$store', '$stateParams', '$q', '$ionicModal', '$window', '$order',
    function($scope, $http, $location, $store, $stateParams, $q, $ionicModal, $window, $order) {
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
                $order.register(order.orderId);
                $window.location.href = '/orders/' + encodeURIComponent(order.orderId);
            } else {
              // order is not found or no longer available.
              $scope.codeNotAvailable = true;
            }
          });
        }
    };
}];

var createOrder = ['$scope', '$http', '$location', '$store', '$window', '$order',
    function($scope, $http, $location, $store, $window, $order) {
    $scope.createOrder = {};
    $scope.submitted = false;
    var uid = $store.get('_orderlyst_uid');
    $scope.hasAccount = (uid !== -1);

    // Retrieve name if user has an account
    if ($scope.hasAccount) {
        $http
        .get('/api/users/' + encodeURIComponent(uid))
        .then(function (response) {
            $scope.userName = response.data.name;
        });
    }

    $scope.submit = function() {
        var createOrder = $scope.createOrder;
        $scope.submitted = true;
        if (createOrder.name === undefined || createOrder.orderName === undefined) return;
        var values = {};
        values.hostUserId = uid;
        values.name = createOrder.orderName;
        // We only care about the time now
        if (createOrder.closingAt) {
            var date = new Date();
            values.closingAt = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + ' ' +
                    createOrder.closingAt;
        }
        // First create user and go to order page
        if (hasAccount) {
            $http.post(
                '/api/orders',
                values
            ).success(function (data) {
                $order.register(response.data.orderId);
                $window.location.href = '/orders/' + encodeURIComponent(data.orderId) + '?new=true';
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
                $order.register(response.data.orderId);
                $window.location.href = '/orders/' + encodeURIComponent(response.data.orderId) + '?new=true';
            });
        }
    };
}];

var viewOrder = ['$scope', '$http', '$stateParams', '$store', '$location',
    'loadOrder', '$ionicTabsDelegate', '$timeout', '$ionicModal', '$ionicPopup', '$ionicPopover', '$q',
    '$ionicSideMenuDelegate', '$order',
    function ($scope, $http, $stateParams, $store, $location, loadOrder,
              $ionicTabsDelegate, $timeout, $ionicModal, $ionicPopup, $ionicPopover, $q, $ionicSideMenuDelegate, $order) {

      $scope.uid              = $store.get('_orderlyst_uid');
      var hasAccount       = ($scope.uid !== -1);
      $scope.isLoading = true;
      $scope.scrolling = false;
      $scope.isOwner = false;
      $scope.orderFormData = {};
      $scope.itemFormData = {'user': $scope.uid, 'quantity': 1, 'submitted': false};
      $scope.additionalFee = { 'surcharge': 0, 'tax': 0, 'submitted': false};

      $order.setScope($scope);
      $order.register($stateParams.orderId);

      // Setup new order item modal form
      $ionicModal.fromTemplateUrl('/partials/new', function(modal) {
          $scope.addItemModal = modal;
      }, {
          scope: $scope,
          animation: 'slide-in-up',
          hardwareBackButtonClose: false
      });

      // For toggling sideMenu
      $scope.toggleSideMenu = function() {
          $ionicSideMenuDelegate.toggleLeft();
      };

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

      $scope.showChangeNamePopup = function() {
        $scope.changeNameData = angular.copy($scope.userDictionary[$scope.uid]);
        var popup = $ionicPopup.show({
          template: '<input type="text" ng-model="changeNameData.name"/>',
          title: 'Change Your Name',
          scope: $scope,
          buttons: [
            { text: 'Cancel',
              onTap: function(e) {
                if ($scope.changeNameData.name === '' || $scope.changeNameData.name === undefined) {
                  $scope.changeNameData = angular.copy($scope.userDictionary[$scope.uid]);
                }
                return false;
              }
            },
            {
              text: '<b>Save</b>',
              type: 'button-filled',
              onTap: function(e) {
                if ($scope.changeNameData.name === '' || $scope.changeNameData.name === undefined) {
                  $scope.changeNameData = angular.copy($scope.userDictionary[$scope.uid]);
                  e.preventDefault();
                } else if ($scope.changeNameData.name === $scope.userDictionary[$scope.uid].name) {
                    return false;
                } else {
                  return $scope.changeNameData.name;
                }
              }
            }
          ]
        });
        popup.then(function(name) {
          if (name === false) return;
          $http.post(
            '/api/users/' + $scope.uid,
            {
              name: name
            }
          ).success(function(data) {
            $scope.userDictionary[$scope.uid].name = name;
          });
        });
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

      // Setup popover

      $scope.showJoinLink = false;
      $scope.joinLink = '';
      $scope.showLink = function() {
          $scope.showJoinLink = true;
          $scope.selectJoinLink();
      };

      $scope.selectJoinLink = function() {
          $timeout(function() {
              var elem = indow.document.getElementById('joinLink');
              elem.setSelectionRange(0, elem.value.length);
          });
      };

      $ionicPopover.fromTemplateUrl('partials/orderPopover', {
          scope: $scope
      }).then(function(popover) {
          $scope.popover = popover;
      });

      $scope.openPopover = function($event) {
          $scope.popover.show($event);
      };

      $scope.$on('popover.hidden', function() {
          // Execute action
          $scope.showJoinLink = false;
      });

      $scope.$on('$destroy', function() {
          $scope.addItemModal.remove();
          $scope.additionalFeeModal.remove();
          $scope.popover.remove();
      });

      // For showing new item added message
      var notify = function(message, type) {
          $scope.alertOn = true;
          $scope.alertMessage = message;
          $scope.alertType = type;
          $timeout(function() {
              $scope.alertOn = false;
          }, 1000);
      };

      // To check if user has any order items
      $scope.hasOrderItems = function() {
          return ($scope.items.filter(function(i) {
              return i.UserUserId == $scope.uid;
          }).length > 0);
      };

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
              //$scope.items.push(data);
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
          var createItemResponse = function (data) {
              $scope.isLoading = false;
              $scope.items.push(data);
          };
          for (var i = 0; i < orderItemData.quantity; i++) {
              $http.post(
                  '/api/orders/' + $scope.order.orderId + '/items',
                  orderItemData
              ).success(createItemResponse);
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

      $scope.getSurcharge = function() {
          return $scope.order.surcharge;
      };

      $scope.getTax = function() {
          return $scope.order.tax * ($scope.order.surcharge + $scope.subtotalFee()) / 100;
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

      $order
        .getItems()
        .then(function(items){
          console.log($scope.items);
          console.log(items);
          $scope.items.forEach(function(item) {
            $order.getUser(item.UserUserId, function(user){
              $scope.userDictionary[user.userId] = user;
            });
          });
          $scope.isLoading = false;
        });

      var renderPage = function(order) {
        $scope.isOwner = $scope.uid === $scope.order.UserUserId;
        $scope.additionalFee = { 'surcharge': $scope.order.surcharge, 'tax': $scope.order.tax, 'submitted': false};

        if (!hasAccount) {
          $location.url('/join/' + $scope.order.code);
        }

        $scope.showJoinLink = false;
        $scope.joinLink = $location.protocol() + "://" + $location.host() + ':' + $location.port() + '/join/' + $scope.order.code;

        // Check if the order was newly created
        if ($stateParams.new) {
            var newOrderPopup = function () {

                var popup = $ionicPopup.show({
                    template: '<div class="spacer text-center">{{order.code}}</div>',
                    title: "<h3>Got 'yer Code!</h3>",
                    scope: $scope,
                    buttons: [
                        {
                            text: 'Get to Order',
                            type: 'button-filled'
                        }
                    ]
                });
            };
            newOrderPopup();
        }

        // fetch user details for current user
        $order
          .getUser($scope.uid)
          .then(function(user){
            $scope.userDictionary[user.userId] = user;
          });

        // fetch order owner details
        $order
          .getUser($scope.order.UserUserId)
          .then(function(user){
            $scope.userDictionary[user.userId] = user;
          });

    };


    $order
      .getOrder()
      .then(renderPage);
}];


module.exports = {
    startOrder: startOrder,
    joinOrder: joinOrder,
    createOrder: createOrder,
    viewOrder: viewOrder
};
