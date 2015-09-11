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
                    $location.url('/orders/' + data.orderId);
            });
        } else {
            $location.url('/create');
        }
    };
}];


var joinOrder = ['$scope', '$http', '$location', '$store', '$stateParams',
    function($scope, $http, $location, $store, $stateParams) {
    $scope.joinOrder = {};
    var orderId = $stateParams.id;
    if (orderId !== null) {
        $http.get('/api/orders/' + orderId).
        success(function(data) {
                $scope.joinOrder.code = data.code;
        });
    }
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
                    // NEED CLARIFICATION ON API
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
        ).success(function(data) {
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
                {hostUserId: uid}
            ).success(function(data) {
                $location.url('/orders/' + data.orderId);
            });
        } else {
            $http.post(
                '/api/users',
                {name: name}
            ).then(function (data) {
                // Save uid in local storage
                $store.set('_orderlyst_uid', data.data.userId);
                return $http.post(
                    '/api/orders',
                    {hostUserId: data.data.userId});
            }).then(function (data) {
                $location.url('/orders/' + data.orderId);
            });
        }
    };
}];

var viewOrder = ['$scope', '$http', '$stateParams', '$store', '$location',
    function ($scope, $http, $stateParams, $store, $location) {
    var id               = $stateParams.orderId;
    var uid              = $store.get('_orderlyst_uid');
    var hasAccount       = (uid !== -1);
    $scope.isLoading = false;
    $scope.formData = {'user': uid};
    $scope.userDictionary = {};
    $scope.items = [];

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
        $location.url('/join/' + id);
    }

    $http.get('/api/orders/' + id + '/items').
    success(function (data) {
        $scope.items = data;
        data.map(function(datum) {
            fetchUserDetail(datum.user);
        });
    });

    // Scope methods
    $scope.createOrderItem = function() {
        var orderItemData = angular.copy($scope.formData);
        if (orderItemData.name === '' ||
            orderItemData.price === '' ||
            isNaN(+orderItemData.price)) return;
        $scope.isLoading = true;
        // Clear formData
        $scope.formData.name = '';
        $scope.formData.price = '';
        $http.post(
            '/api/orders/' + id + '/items',
            orderItemData
        ).success(function(data) {
            $scope.isLoading = false;

            $scope.items.push(data);
        });
    };
    $scope.removeOrderItem = function(item) {
        $scope.isLoading = true;
        $http.delete(
            '/api/orders/' + id + '/items/' + item.itemId
        ).success(function(data) {
                $scope.isLoading = false;
                $scope.items = $scope.items.filter(function(i) {
                    return i.itemId !== item.itemId;
                });
            });
    };
}];


module.exports = {
    startOrder: startOrder,
    joinOrder: joinOrder,
    createOrder: createOrder,
    viewOrder: viewOrder
};
