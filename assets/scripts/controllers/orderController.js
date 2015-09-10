var joinOrder = ['$scope', '$http', '$location', '$store', '$routeParams',
    function($scope, $http, $location, $store, $routeParams) {
    $scope.joinOrder = {};
    var orderId = $routeParams.id;
    if (orderId !== null) {
        $http.get('/api/orders/' + orderId).
        success(function(data) {
                $scope.joinOrder.code = data.code;
        });
    }
    var uid = $store.get('_uid');
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
                    $store.set('_uid', data._id);
                    // NEED CLARIFICATION ON API
                    $location.url('/orders/' + orderCode);
            });
        }
    };
}];

var createOrder = ['$scope', '$http', '$location', '$store',
    function($scope, $http, $location, $store) {
    $scope.createOrder = {};
    var uid = $store.get('_uid');
    var hasAccount = (uid !== -1);
    if (hasAccount) {
        $http.post(
            '/api/orders',
            {hostUserId: uid}
        ).success(function(data) {
                $location.url('/orders/' + data._id);
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
                $location.url('/orders/' + data._id);
            });
        } else {
            $http.post(
                '/api/users',
                {name: name}
            ).success(function (data) {
                // Save uid in local storage
                $store.set('_uid', data._id);
                return $http.post(
                    '/api/orders',
                    {hostUserId: data._id});
            }).success(function (data) {
                $location.url('/orders/' + data._id);
            });
        }
    };
}];

var viewOrder = ['$scope', '$http', '$routeParams', '$store',
    function ($scope, $http, $routeParams, $store) {
    var id               = $routeParams.orderId;
    var uid              = $store.get('_uid');
    var hasAccount       = (uid !== -1);
    $scope.isLoading = false;
    $scope.items = {};
    $scope.formData = {'user': uid};
    // Authenticate user
    if (!hasAccount) {
        $location.url('/join/' + id);
    }

    $http.get('/api/orders/' + id + '/items').
        success(function (data) {
            $scope.items = data;
        }
    );

    // Scope methods
    $scope.createOrderItem = function() {
        var formData = $scope.formData;
        if (formData.name === '' || formData.price === '') return;
        $scope.isLoading = true;
        $http.post(
            '/api/orders/' + id + '/items',
            formData
        ).success(function(data) {
            $scope.isLoading = false;
            $scope.items.push(formData);
            // Clear formData
            $scope.formData.name = '';
            $scope.formData.price = '';
        });
    };
    $scope.removeOrderItem = function(item) {
        $scope.isLoading = true;
        $http.delete(
            '/api/orders/' + id + '/items/' + item._id
        ).success(function(data) {
                $scope.isLoading = false;
                $scope.items = $scope.items.filter(function(i) {
                    return i._id !== item._id;
                });
            });
    };
}];


module.exports = {
    joinOrder: joinOrder,
    createOrder: createOrder,
    viewOrder: viewOrder
};
