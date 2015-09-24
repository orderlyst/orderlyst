var pluralize = require('../helpers/pluralize.js');

var startOrder = ['$scope', '$http', '$window', '$store', '$location', '$order',
    function($scope, $http, $window, $store, $location, $order) {
        var uid = $store.get('_orderlyst_uid');
        var hasAccount = (uid !== -1);
        //$scope.createOrder = function() {
        //    if (hasAccount) {
        //        $http.post(
        //            '/api/orders',
        //            {
        //              hostUserId: uid
        //            }
        //        ).success(function (data) {
        //          $order.register(data.orderId);
        //          $window.location.href = '/orders/' + encodeURIComponent(data.orderId) + '?new=true';
        //        });
        //    } else {
        //        $location.url('/create');
        //    }
        //};
    }
];

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
                    '/api/orders/search', {
                        code: $scope.joinOrder.code
                    },
                    {
                      headers: {
                        "x-access-token": $window.token
                      }
                    }
                ));

                if (!$scope.hasAccount) {
                    console.log('creating user');
                    promises.push($http.post(
                        '/api/users', {
                            name: $scope.joinOrder.name
                        },
                        {
                          headers: {
                            "x-access-token": $window.token
                          }
                        }
                    ));
                }

                $q.all(promises).then(function(result) {
                    var order = result[0].data;
                    if (result[1]) {
                        // user created
                        $scope.hasAccount = true;
                        var user = result[1].data;
                        $store.set('_orderlyst_uid', user.userId);
                    }
                    if (order) {
                        $order.register(order.orderId);
                        $location.url('/orders/' + encodeURIComponent(order.orderId));
                    } else {
                        // order is not found or no longer available.
                        $scope.codeNotAvailable = true;
                    }
                });
            }
        };
    }
];

var createOrder = ['$scope', '$http', '$location', '$store', '$window', '$order',
    function($scope, $http, $location, $store, $window, $order) {
        $scope.createOrder = {};
        $scope.submitted = false;
        var uid = $store.get('_orderlyst_uid');
        $scope.hasAccount = (uid !== -1);

        // Retrieve name if user has an account
        if ($scope.hasAccount) {
            $http
                .get('/api/users/' + encodeURIComponent(uid), {
                  headers: {
                    "x-access-token": $window.token
                  }
                })
                .then(function(response) {
                    $scope.userName = response.data.name;
                });
        }

        var date = new Date();
        $scope.createOrder.closingAt = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59);

        $scope.timePickerObject24Hour = {
            inputEpochTime: 86340,
            step: 1,
            setButtonType: 'button-filled',
            closeButtonType: 'button-blank',
            titleLabel: 'Choose your order closing time',
            callback: function(val) { //Mandatory
                timePicker24Callback(val);
            }
        };

        function timePicker24Callback(val) {
            if (typeof(val) === 'undefined') {
                console.log('Time not selected');
            } else {
                $scope.timePickerObject24Hour.inputEpochTime = val;
                var selectedTime = new Date(val * 1000);
                $scope.createOrder.closingAt = new Date(date.getFullYear(), date.getMonth(), date.getDate(),
                    selectedTime.getUTCHours(), selectedTime.getUTCMinutes());
                console.log('Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), ':', selectedTime.getUTCMinutes(), 'in UTC');
            }
        }

        $scope.submit = function() {
            var createOrder = $scope.createOrder;
            $scope.submitted = true;

            var values = {};
            values.name = createOrder.orderName;
            // We only care about the time now
            if (createOrder.closingAt) {
                values.closingAt = createOrder.closingAt;
            }

            // First create user and go to order page
            if ($scope.hasAccount) {
                if (createOrder.orderName === undefined) return;
                values.hostUserId = uid;
                $http
                  .post(
                    '/api/orders',
                    values,
                    {
                      headers: {
                        "x-access-token": $window.token
                      }
                    }
                  )
                  .then(function(response) {
                    $order.register(response.data.orderId);
                    $location.url('/orders/' + encodeURIComponent(response.data.orderId) + '?new=true');
                  });
            } else {
                if (createOrder.name === undefined || createOrder.orderName === undefined) return;
                $http
                  .post(
                    '/api/users', {
                        name: createOrder.name
                    },
                    {
                      headers: {
                        "x-access-token": $window.token
                      }
                    }
                  )
                  .then(function(response) {
                    // Save uid in local storage
                    $store.set('_orderlyst_uid', response.data.userId);
                    values.hostUserId = response.data.userId;
                    return $http.post(
                        '/api/orders',
                        values,
                        {
                          headers: {
                            "x-access-token": $window.token
                          }
                        }
                    );
                  })
                  .then(function(response) {
                    $order.register(response.data.orderId);
                    $location.url('/orders/' + encodeURIComponent(response.data.orderId) + '?new=true');
                  });
            }
        };
    }
];

var viewOrder = ['$scope', '$http', '$stateParams', '$store', '$location',
    '$ionicTabsDelegate', '$timeout', '$ionicModal', '$ionicPopup', '$ionicPopover', '$q',
    '$ionicSideMenuDelegate', '$order', '$window',
    function($scope, $http, $stateParams, $store, $location,
             $ionicTabsDelegate, $timeout, $ionicModal, $ionicPopup, $ionicPopover, $q, $ionicSideMenuDelegate, $order, $window) {

        $scope.uid = $store.get('_orderlyst_uid');
        var hasAccount = ($scope.uid !== -1);
        $scope.isLoading = true;
        $scope.scrolling = false;
        $scope.isOwner = false;
        $scope.orderFormData = {};
        $scope.itemFormData = {
            'user': $scope.uid,
            'quantity': 1,
            'submitted': false
        };;

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
                buttons: [{
                    text: 'Cancel'
                }, {
                    text: "Confirm",
                    type: "button-filled",
                    onTap: function(e) {
                        $scope.toggleLocked();
                    }
                }]
            });
        };

        $scope.openAddItemModal = function() {
            $scope.addItemModal.show();
        };

        $scope.closeAddItemModal = function() {
            $scope.addItemModal.hide();
        };

        $scope.openFacebookShareLink = function(code) {
            $window.open('https://www.facebook.com/dialog/share?app_id=409661689237786&display=popup&href=' + encodeURIComponent('http://orderlyst.this.sg/join/' + code) + '&redirect_uri=' + encodeURIComponent('http://orderlyst.this.sg/fbshareclose'));
        };

        $scope.showChangeNamePopup = function() {
            $scope.changeNameData = angular.copy($scope.userDictionary[$scope.uid]);
            var popup = $ionicPopup.show({
                template: '<input type="text" ng-model="changeNameData.name"/>',
                title: 'Change Your Name',
                scope: $scope,
                buttons: [{
                    text: 'Cancel',
                    onTap: function(e) {
                        if ($scope.changeNameData.name === '' || $scope.changeNameData.name === undefined) {
                            $scope.changeNameData = angular.copy($scope.userDictionary[$scope.uid]);
                        }
                        return false;
                    }
                }, {
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
                }]
            });
            popup.then(function(name) {
                if (name === false) return;
                $http.post(
                    '/api/users/' + $scope.uid, {
                        name: name
                    },
                    {
                      headers: {
                        "x-access-token": $window.token
                      }
                    }
                ).then(function(response) {
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

        // My order scope methods

        // To check if user has any order items
        $scope.hasOrderItems = function() {
            return ($scope.items.filter(function(i) {
                return i.UserUserId == $scope.uid;
            }).length > 0);
        };

        $scope.numActiveUsers = function() {
            return $scope.items.reduce(function(acc, next) {
                if (acc.ids.indexOf(next.UserUserId) < 0) {
                    acc.ids.push(next.UserUserId);
                    acc.count++;
                }
                return acc;
            }, {
                'count': 0,
                'ids': []
            }).count;
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
                '/api/orders/' + $scope.order.orderId + '/items', {
                    name: name,
                    price: price,
                    user: $scope.uid
                },
                {
                  headers: {
                    "x-access-token": $window.token
                  }
                }
            )
                .then(function(response) {
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
                !(/^[1-9][0-9]*(\.[0-9]([05])?)?$/.test(orderItemData.price)) ||
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
            var createItemResponse = function(data) {
                $scope.isLoading = false;
                if ($scope.items.filter(function(item) {
                        return item.itemId === data.itemId;
                    }).length > 0) return;
                $scope.items.push(data);
            };
            for (var i = 0; i < orderItemData.quantity; i++) {
                $http.post(
                    '/api/orders/' + $scope.order.orderId + '/items',
                    orderItemData,
                    {
                      headers: {
                        "x-access-token": $window.token
                      }
                    }
                ).success(createItemResponse);
            }
            notify(pluralize(orderItemData.quantity, orderItemData.name) + ' added', 'success');
        };
        $scope.removeOrderItem = function(item) {
            $scope.isLoading = true;
            $http.delete(
                '/api/orders/' + $scope.order.orderId + '/items/' + item.itemId,
                {
                  headers: {
                    "x-access-token": $window.token
                  }
                }
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
                !(/^[0-9]+(\.[0-9]+)?$/.test(fees.tax))) return;
            $scope.isLoading = true;
            // Hide modal
            $scope.closeAdditionalFeeModal();
            fees.submitted = false;
            $http.post(
                '/api/orders/' + $scope.order.orderId,
                fees,
                {
                  headers: {
                    "x-access-token": $window.token
                  }
                }
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
                $scope.order,
                {
                  headers: {
                    "x-access-token": $window.token
                  }
                }
            ).success(function(data) {});
        };

        $order
            .getItems()
            .then(function(items) {
                $scope.items.forEach(function(item) {
                    $order.getUser(item.UserUserId, function(user) {
                        $scope.userDictionary[user.userId] = user;
                    });
                });
                $scope.isLoading = false;
            });

        var renderPage = function(order) {
            $scope.isOwner = $scope.uid === $scope.order.UserUserId;
            $scope.additionalFee = {
                'surcharge': $scope.order.surcharge,
                'tax': $scope.order.tax,
                'submitted': false
            };

            if (!hasAccount) {
                $location.url('/join/' + $scope.order.code);
            }

            $scope.getClosingTime = function() {
                var date = new Date($scope.order.closingAt);
                return date.getHours() + ':' + date.getMinutes();
            };

            $scope.showJoinLink = false;
            $scope.joinLink = $location.protocol() + "://" + $location.host() + ':' + $location.port() + '/join/' + $scope.order.code;

            //$scope.additionalFee = {
            //    'surcharge': $scope.order.surcharge,
            //    'tax': $scope.order.tax,
            //    'name': $scope.order.name,
            //    'closingAt': $scope.order.closingAt,
            //    'submitted': false
            //}

            // Check if the order was newly created
            if ($stateParams.new) {
                var newOrderPopup = function() {

                    var popup = $ionicPopup.show({
                        template: '<div class="spacer text-center">{{order.code}}</div>',
                        title: "<h3>Got 'yer Code!</h3>",
                        scope: $scope,
                        buttons: [{
                            text: 'Get to Order',
                            type: 'button-filled'
                        }]
                    });
                };
                newOrderPopup();
            }

            // fetch user details for current user
            $order
                .getUser($scope.uid)
                .then(function(user) {
                    $scope.userDictionary[user.userId] = user;
                });

            // fetch order owner details
            $order
                .getUser($scope.order.UserUserId)
                .then(function(user) {
                    $scope.userDictionary[user.userId] = user;
                });

        };


        $order
            .getOrder()
            .then(renderPage);
    }
];


module.exports = {
    startOrder: startOrder,
    joinOrder: joinOrder,
    createOrder: createOrder,
    viewOrder: viewOrder
};
