var pluralize = require('../helpers/pluralize.js');

var startOrder = ['$scope', '$http', '$window', '$store', '$location', '$order',
    function($scope, $http, $window, $store, $location, $order) {
        var uid = $store.get('_orderlyst_uid');
        var hasAccount = (uid !== -1);

        $scope.disconnected = false;
        $scope.$watch(
            function() {
                return !$window.navigator.onLine;
            }, function(newValue, oldValue) {
                $scope.disconnected = newValue;
            }
        );


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

var joinOrder = ['$scope', '$http', '$location', '$store', '$stateParams', '$q', '$ionicModal', '$window', '$order', '$ionicPopup',
    function($scope, $http, $location, $store, $stateParams, $q, $ionicModal, $window, $order, $ionicPopup) {
        $scope.joinOrder = {};
        $scope.submitted = false;
        $scope.joinOrder.code = $stateParams.orderCode;
        var uid = $store.get('_orderlyst_uid');
        $scope.hasAccount = (uid !== -1);
        $scope.codeNotAvailable = false;

        if ($scope.hasAccount) {
            $scope.joinOrder.name = uid;
            if ($scope.hasAccount) {
                $http
                    .get('/api/users/' + encodeURIComponent(uid), {
                      headers: {
                        "x-access-token": $window.token
                      }
                    })
                    .then(function(response) {
                        $scope.joinOrder.name = response.data.name;
                        $scope.userName = response.data.name;
                    });
            }
        }

        $scope.logoutConfirm = function() {
          $ionicPopup.show({
              template: "Are you sure you want to log out? Once you log out, all associated items and orders will be recovered.",
              title: "Log Out",
              scope: $scope,
              buttons: [{
                  text: 'Cancel'
              }, {
                  text: "Confirm",
                  type: "button-filled",
                  onTap: function(e) {
                    $store.set('_orderlyst_uid', -1);
                    uid = -1;
                    $scope.hasAccount = false;
                  }
              }]
          });
        };

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
                        $scope.userName = $scope.joinOrder.name;
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

var createOrder = ['$scope', '$http', '$location', '$store', '$window', '$order', '$ionicPopup',
    function($scope, $http, $location, $store, $window, $order, $ionicPopup) {
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

        $scope.logoutConfirm = function() {
          $ionicPopup.show({
              template: "Are you sure you want to log out? Once you log out, all associated items and orders will be recovered.",
              title: "Log Out",
              scope: $scope,
              buttons: [{
                  text: 'Cancel'
              }, {
                  text: "Confirm",
                  type: "button-filled",
                  onTap: function(e) {
                    $store.set('_orderlyst_uid', -1);
                    uid = -1;
                    $scope.hasAccount = false;
                  }
              }]
          });
        };

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
        };
        $scope.userItemsFormData = { 'submitted': false };
        $scope.ownerItemsFormData = { 'submitted': false };

        $scope.disconnected = false;

        $scope.$watch(
            function() {
                return !$window.navigator.onLine;
            }, function(newValue, oldValue) {
                $scope.disconnected = newValue;
            }
        );

        $order.setScope($scope);
        $order.register($stateParams.orderId);

        // Setup notification method
        var notify = function(message, type) {
            $scope.closePopover();
            $scope.alertOn = true;
            $scope.alertMessage = message;
            $scope.alertType = type;
            $timeout(function() {
                $scope.alertOn = false;
            }, 1000);
        };

        $scope.notify = notify;

        // For toggling sideMenu
        $scope.toggleSideMenu = function() {
            $ionicSideMenuDelegate.toggleLeft();
        };

        $scope.showLockOrderPopup = function() {

            var popup = $ionicPopup.show({
                template: "Are you sure that you want to lock the order? " +
                "After you lock the order, people will not be able to add more item to the order.",
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

        $scope.nameChanging = false;

        $scope.toggleNameChanging = function() {
            if ($scope.nameChanging) {
                if ($scope.nameChangeData === undefined || $scope.nameChangeData === '') {
                    console.log(1);
                    return;
                } else if ($scope.nameChangeData !== $scope.userDictionary[$scope.uid].name) {
                    console.log(2);
                    $http.post(
                        '/api/users/' + encodeURIComponent($scope.uid), {
                            name: $scope.nameChangeData
                        },
                        {
                            headers: {
                                "x-access-token": $window.token
                            }
                        }
                    ).then(function(response) {
                            $scope.userDictionary[$scope.uid].name = $scope.nameChangeData;
                            notify("Your name was changed successfully", "success");
                    });
                }
                console.log(3);
            }
            $scope.nameChanging = !$scope.nameChanging;
        };

        // Setup order settings modal form

        $ionicModal.fromTemplateUrl('/partials/orderSettings', function(modal) {
            $scope.orderSettingsModal = modal;
        }, {
            scope: $scope,
            animation: 'slide-in-up',
            hardwareBackButtonClose: false
        });

        $scope.openOrderSettingsModal = function() {
            $scope.orderSettingsModal.show();
        };

        $scope.closeOrderSettingsModal = function() {
            $scope.orderSettingsModal.hide();
        };

        $scope.timePickerObject24Hour = {
            inputEpochTime: 0,
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
                var date = new Date();
                $scope.timePickerObject24Hour.inputEpochTime = val;
                var selectedTime = new Date(val * 1000);
                $scope.orderSettings.closingAt = new Date(date.getFullYear(), date.getMonth(), date.getDate(),
                    selectedTime.getUTCHours(), selectedTime.getUTCMinutes());
                console.log('Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), ':', selectedTime.getUTCMinutes(), 'in UTC');
            }
        }

        // Order Settings scope methods

        $scope.updateOrderSettings = function() {
            var settings = $scope.orderSettings;
            settings.submitted = true;
            if (settings.surcharge === undefined ||
                settings.tax === undefined ||
                !(/^[0-9]+(\.[0-9]([05])?)?$/.test(settings.surcharge)) ||
                !(/^[0-9]+(\.[0-9]+)?$/.test(settings.tax)) ||
                settings.name === undefined) return;
            $scope.isLoading = true;
            // Hide modal
            $scope.closeOrderSettingsModal();
            settings.submitted = false;
            $http.post(
                '/api/orders/' + encodeURIComponent($scope.order.orderId),
                settings,
                {
                    headers: {
                        "x-access-token": $window.token
                    }
                }
            ).success(function(data) {
                    $scope.isLoading = false;
                    $scope.order = data;
                    notify("Order has been updated", 'success');
            });
        };

        // Setup popover

        $ionicPopover.fromTemplateUrl('partials/orderPopover', {
            scope: $scope
        }).then(function(popover) {
            $scope.popover = popover;
        });

        $scope.openPopover = function($event) {
            $scope.popover.show($event);
        };

        $scope.closePopover = function($event) {
            $scope.popover.hide($event);
        };

        $scope.$on('$destroy', function() {
            $scope.addItemModal.remove();
            $scope.orderSettingsModal.remove();
            $scope.popover.remove();
        });



        // My order scope methods

        // To check if user has any order items
        $scope.hasOrderItems = function() {
            return ($scope.items.filter(function(i) {
                return i.UserUserId == $scope.uid;
            }).length > 0);
        };

        // Setup new order item modal form
        $ionicModal.fromTemplateUrl('/partials/new', function(modal) {
            $scope.addItemModal = modal;
        }, {
            scope: $scope,
            animation: 'slide-in-up',
            hardwareBackButtonClose: false
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
                '/api/orders/' + encodeURIComponent($scope.order.orderId) + '/items', {
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
            console.log(orderItemData);
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
                $store.set('_orderlyst_items_' + data.itemId, data);
                var idArray = $scope.items.map(function(item) {
                    return item.itemId;
                });
                console.log($scope.items);

                $store.set('_orderlyst_orders_' + $scope.order.orderId + '_items', idArray);
            };
            for (var i = 0; i < orderItemData.quantity; i++) {
                $http.post(
                    '/api/orders/' + encodeURIComponent($scope.order.orderId) + '/items',
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
                '/api/orders/' + encodeURIComponent($scope.order.orderId) + '/items/' + item.itemId,
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

                    var idArray = $scope.items.map(function(item) {
                        return item.itemId;
                    });

                    $store.set('_orderlyst_orders_' + $scope.order.orderId + '_items', idArray);

                    $store.remove('_orderlyst_items_' + item.itemId);

                    notify(pluralize(1, item.name) + ' removed', 'warning');
                });
        };

        // Edit User Order Items
        $ionicModal.fromTemplateUrl('/partials/editUserItems', function(modal) {
            $scope.editUserItemsModal = modal;
        }, {
            scope: $scope,
            animation: 'slide-in-up',
            hardwareBackButtonClose: false
        });

        $scope.openEditUserItemsModal = function(items) {
            $scope.userItemsFormData.user = items[0].UserUserId;
            $scope.userItemsFormData.name = items[0].name;
            $scope.userItemsFormData.price = items[0].price;
            $scope.userItemsFormData.quantity = items.length;
            $scope.userItemsFormData.items = items;
            $scope.editUserItemsModal.show();
        };

        $scope.incrementUserItemsFormDataQuantity = function() {
            // Cast the quantity to numeric first
            $scope.userItemsFormData.quantity = +$scope.userItemsFormData.quantity;
            if ($scope.userItemsFormData.quantity < 1) {
                $scope.userItemsFormData.quantity = 1;
            } else {
                console.log('add one');
                $scope.userItemsFormData.quantity++;
            }
        };

        $scope.decrementUserItemsFormDataQuantity = function() {
            // Cast the quantity to numeric first
            $scope.userItemsFormData.quantity = +$scope.userItemsFormData.quantity;
            if ($scope.userItemsFormData.quantity > 0) {
                console.log('sub one');
                $scope.userItemsFormData.quantity--;
            } else {
                $scope.userItemsFormData.quantity = 0;
            }
        };

        $scope.closeUserItemsFormModal = function() {
            $scope.editUserItemsModal.hide();
        };

        $scope.editUserItemsForm = function() {
            $scope.userItemsFormData.submitted = true;
            var orderItemData = angular.copy($scope.userItemsFormData);
            delete orderItemData.items;
            console.log(orderItemData);
            if (orderItemData.name === '' || orderItemData.name === undefined ||
                orderItemData.price === '' || orderItemData.price === undefined ||
                !(/^[1-9][0-9]*(\.[0-9]([05])?)?$/.test(orderItemData.price))) return;
            $scope.isLoading = true;

            // Clear formData
            $scope.userItemsFormData.submitted = false;

            // Remove all items then re-add
            var promises = [];

            $scope.userItemsFormData.items.map(function(item) {
                var promise = $http.delete(
                    '/api/orders/' + encodeURIComponent($scope.order.orderId) + '/items/' + item.itemId,
                    {
                        headers: {
                            "x-access-token": $window.token
                        }
                    }
                );
                promises.push(promise);
            });

            // Add items quantity times
            var createItemResponse = function(data) {
                if ($scope.items.filter(function(item) {
                        return item.itemId === data.itemId;
                    }).length > 0) return;
                $scope.items.push(data);
                $store.set('_orderlyst_items_' + data.itemId, data);
            };
            for (var i = 0; i < orderItemData.quantity; i++) {
                var promise = $http.post(
                    '/api/orders/' + encodeURIComponent($scope.order.orderId) + '/items',
                    orderItemData,
                    {
                        headers: {
                            "x-access-token": $window.token
                        }
                    }
                ).success(createItemResponse);
                promises.push(promise);
            }
            $q.all(promises).then(function(response) {
                var removedItemIds = $scope.userItemsFormData.items.map(function(item) {
                    return item.itemId;
                });
                $scope.items = $scope.items.filter(function(i) {
                    return removedItemIds.indexOf(i.itemId) < 0;
                });
                removedItemIds.map(function(id) {
                    $store.remove('_orderlyst_items_' + id);
                });

                var idArray = $scope.items.map(function(item) {
                    return item.itemId;
                });

                $store.set('_orderlyst_orders_' + $scope.order.orderId + '_items', idArray);

                // Hide modal
                $scope.closeUserItemsFormModal();
                notify("Items were successfully editted", "success");
            })
        };

        // Edit order item on Summary page
        $ionicModal.fromTemplateUrl('/partials/editOwnerItems', function(modal) {
            $scope.editOwnerItemsModal = modal;
        }, {
            scope: $scope,
            animation: 'slide-in-up',
            hardwareBackButtonClose: false
        });

        $scope.openEditOwnerItemsModal = function(items) {
            $scope.ownerItemsFormData.name = items[0].name;
            $scope.ownerItemsFormData.price = items[0].price;
            $scope.ownerItemsFormData.quantity = items.length;
            $scope.ownerItemsFormData.items = items;
            $scope.editOwnerItemsModal.show();
        };

        $scope.closeOwnerItemsFormModal = function() {
            $scope.editOwnerItemsModal.hide();
        };

        $scope.editOwnerItemsForm = function() {
            $scope.ownerItemsFormData.submitted = true;
            var orderItemData = angular.copy($scope.ownerItemsFormData);
            delete orderItemData.items;
            console.log(orderItemData);
            if (orderItemData.price === '' || orderItemData.price === undefined ||
                !(/^[1-9][0-9]*(\.[0-9]([05])?)?$/.test(orderItemData.price))) return;
            $scope.isLoading = true;

            // Clear formData
            $scope.userItemsFormData.submitted = false;

            // Remove all items then re-add
            var promises = [];

            // Update items prices
            var updateItemResponse = function(data) {
                $store.set('_orderlyst_items_' + data.itemId, data);
            };

            $scope.ownerItemsFormData.items.map(function(item) {
                var promise = $http.post(
                    '/api/orders/' + encodeURIComponent($scope.order.orderId) + '/items/' + item.itemId,
                    orderItemData,
                    {
                        headers: {
                            "x-access-token": $window.token
                        }
                    }
                ).success(updateItemResponse);
                promises.push(promise);
            });

            $q.all(promises).then(function(response) {
                // Hide modal
                $scope.closeOwnerItemsFormModal();
                notify("The price of all " + orderItemData.name + " successfully changed", "success");

                var idArray = $scope.items.map(function(item) {
                    return item.itemId;
                });

                $store.set('_orderlyst_orders_' + $scope.order.orderId + '_items', idArray);
            })
        };

        // Fee aggregate scope methods
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
                fees
            ).success(function(data) {
                    $scope.isLoading = false;
                    $scope.order = data;
                    $store.set('_orderlyst_orders_' + $scope.order.orderId, $scope.order);
                });
        };

        $scope.getSurcharge = function() {
            return $scope.order.surcharge;
        };

        $scope.getTax = function() {
            return $scope.order.tax * ($scope.order.surcharge + $scope.subtotalFee()) / 100;
        };

        $scope.subtotalFee = function() {
            return $scope.items.reduce(function(a, b) {
                return a + parseFloat(b.price);
            }, 0);
        };

        $scope.userSubtotalFee = function(uid) {
          return $scope.items.filter(function(item) {
             return item.UserUserId === uid;
          }).reduce(function(a, b) {
              return a + parseFloat(b.price);
          }, 0);
        };

        $scope.itemCollectionSubtotalFee = function(items) {
          return items.reduce(function(a, b) {
              return a + parseFloat(b.price);
          }, 0);
        };

        $scope.totalFee = function() {
            return ($scope.subtotalFee() + $scope.order.surcharge) * (1 + $scope.order.tax / 100);
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

        // To toggle isOpen status of order

        $scope.toggleLocked = function() {
            $scope.order.isOpen = !$scope.order.isOpen;
            $http.post(
                '/api/orders/' + encodeURIComponent($scope.order.orderId),
                $scope.order,
                {
                  headers: {
                    "x-access-token": $window.token
                  }
                }
            ).success(function(data) {});
        };

        // To watch isOpen scope change and notify to clients
        $scope.$watch("order.isOpen", function(newValue, oldValue) {
            // Sanity check
            if (newValue !== oldValue && oldValue  !== undefined) {
                if (newValue) {
                    if ($scope.isOwner) {
                        notify("The order is now open", 'success');
                    } else {
                        notify("The host just opened the order", "success");
                    }
                } else {
                    if ($scope.isOwner) {
                        notify("The order is now locked", 'warning');
                    } else {
                        notify("The host just locked the order", "warning");
                    }
                }
            }
        });

        $scope.$watch("items", function(newValue, oldValue) {
            $scope.items.forEach(function(item) {
                $order.getUser(item.UserUserId, function(user) {
                    $scope.userDictionary[user.userId] = user;
                });
            });
        });

        $order
            .getItems()
            .then(function(items) {
                $scope.items.forEach(function(item) {
                    $order.getUser(item.UserUserId).then(function(user) {
                        $scope.userDictionary[user.userId] = user;
                    });
                });

                $scope.isLoading = false;
            }, function(response) {
            });

        var renderPage = function(order) {
            $scope.isOwner = $scope.uid === $scope.order.UserUserId;

            // Initialize order settings
            $scope.orderSettings = {
                'surcharge': $scope.order.surcharge,
                'tax': $scope.order.tax,
                'name': $scope.order.name,
                'closingAt': $scope.order.closingAt,
                'submitted': false
            };

            var date = new Date($scope.order.closingAt);
            $scope.timePickerObject24Hour.inputEpochTime = date.getHours() * 3600 + date.getMinutes() * 60;


            if (!hasAccount) {
                $location.url('/join/' + encodeURIComponent($scope.order.code));
            }

            // Check if the order was newly created
            if ($stateParams.new) {
                var newOrderPopup = function() {

                    var popup = $ionicPopup.show({
                        template: '<input readonly class="spacer text-center" value="{{order.code}}" onclick="this.focus();this.select()">',
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
                    $scope.nameChangeData = user.name;
                }, function(response) {
                });

            // fetch order owner details
            $order
                .getUser($scope.order.UserUserId)
                .then(function(user) {
                    $scope.userDictionary[user.userId] = user;
                }, function(response) {
                });

        };


        $order
            .getOrder()
            .then(renderPage,
                 function(response) {
                 });
    }
];


module.exports = {
    startOrder: startOrder,
    joinOrder: joinOrder,
    createOrder: createOrder,
    viewOrder: viewOrder
};
