var startOrder = ['$scope', '$http', '$location', '$store',
    function($scope, $http, $location, $store) {
    var uid = $store.get('_orderlyst_uid');
    var hasAccount = (uid !== -1);
    $scope.createOrder = function() {
        if (hasAccount) {
            $http.post(
                '/api/orders',
                {hostUserId: uid}
            ).success(function (data) {
                $location.url('/orders/' + data.code);
            });
        } else {
            $location.url('/create');
        }
    };
}];


var joinOrder = ['$scope', '$http', '$location', '$store', '$stateParams',
    function($scope, $http, $location, $store, $stateParams) {
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
        if ($scope.hasAccount) {
            $location.url('/orders/' + orderCode);
        } else {
            $http.post(
                '/api/users',
                {name: name}
            ).success(function (data) {
                    // Save uid in local storage
                    $store.set('_orderlyst_uid', data.userId);
                    $location.url('/orders/' + orderCode);
            });
        }
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
            {hostUserId: uid}
        ).success(function (data) {
            $location.url('/orders/' + data.code);
        });
    }
    $scope.submit = function() {
        var name = $scope.createOrder.name;
        if (name === "") return;
        // First create user and go to order page
        if (hasAccount) {
            $http.post(
                '/api/orders',
                {hostUserId: uid}
            ).success(function (data) {
                    $location.url('/orders/' + data.code);
            });
        } else {
            $http.post(
                '/api/users',
                {name: name}
            ).then(function (response) {
                // Save uid in local storage
                $store.set('_orderlyst_uid', response.data.userId);
                return $http.post(
                    '/api/orders',
                    {hostUserId: response.data.userId});
            }).then(function (response) {
                $location.url('/orders/' + response.data.code);
            });
        }
    };
}];

var viewOrder = ['$scope', '$http', '$stateParams', '$store', '$location', 'loadOrder', '$ionicTabsDelegate', '$timeout',
    function ($scope, $http, $stateParams, $store, $location, loadOrder, $ionicTabsDelegate, $timeout) {
    // Firstly check if order exists
    if (loadOrder.data === null) {
        // Redirect to home in this case
        $location.url('/');
    } else {
        $scope.order = loadOrder.data;
    }

    var code               = $stateParams.orderCode;
    var uid              = $store.get('_orderlyst_uid');
    var hasAccount       = (uid !== -1);
    $scope.isLoading = true;
    $scope.isOwner = uid === $scope.order.UserUserId;
    $scope.orderFormData = {};
    $scope.itemFormData = {'user': uid};
    $scope.userDictionary = {};
    $scope.items = [];

    // Set default active tab based on isOwner
    if (!$scope.isOwner) {
        $timeout(function(){
            $ionicTabsDelegate.select(1);
        },0);
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
        $location.url('/join/' + code);
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

    // Scope methods
    $scope.createOrderItem = function() {
        var orderItemData = angular.copy($scope.itemFormData);
        if (orderItemData.name === '' ||
            orderItemData.price === '' ||
            isNaN(+orderItemData.price)) return;
        $scope.isLoading = true;
        // Clear formData
        $scope.itemFormData.name = '';
        $scope.itemFormData.price = '';
        $http.post(
            '/api/orders/' + $scope.order.orderId + '/items',
            orderItemData
        ).success(function(data) {
            $scope.isLoading = false;

            $scope.items.push(data);
        });
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
