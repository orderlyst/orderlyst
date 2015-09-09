var joinOrder = ['$rootScope', '$scope', '$http', '$location', '$store',
    function($rootScope, $scope, $http, $location, $store) {
    $scope.joinOrder = {};
    $store.bind($rootScope, '_uid', -1);
    var uid = $store.get('_uid');
    $scope.hasAccount = (uid !== -1);
    $scope.submit = function(joinOrder) {
        var name, orderCode;
        if ($scope.hasAccount) {
            name = uid;
        } else {
            name = joinOrder.name;
        }
        orderCode = joinOrder.code;
        if (name === "" || orderCode === "") return;
        if ($scope.hasAccount) {
            $location.url('/orders/' + orderCode);
        } else {
            $http.post(
                '/api/users',
                {name: name}
            ).success(function (data) {
                    $location.url('/orders/' + orderCode);
            });
        }
    };
}];

joinOrder.$inject = ['$scope', '$http', '$location'];

var createOrder = ['$rootScope', '$scope', '$http', '$location', '$store',
    function($rootScope, $scope, $http, $location, $store) {
    $scope.createOrder = {};
    $store.bind($rootScope, '_uid', -1);
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

var viewOrder = function ($scope, $http, $routeParams) {
    var id               = $routeParams.orderId;
    $http.get('/api/orders/' + id + '/items').
        success(function(data) {
            $scope.items = { '0':
            {'name': '2', 'price': '2'}
        };
        }
    );
};

viewOrder.$inject = ['$scope', '$http', '$routeParams'];


module.exports = {
    joinOrder: joinOrder,
    createOrder: createOrder,
    viewOrder: viewOrder
};
