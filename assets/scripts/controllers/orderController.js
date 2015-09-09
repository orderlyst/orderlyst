var joinOrder = function($scope, $http, $location) {
    $scope.submit = function(joinOrder) {
        var name = joinOrder.name;
        var orderCode = joinOrder.code;
        if (name === "" || orderCode === "") return;
        console.log(name);
        console.log(orderCode);
        // First create user and go to order page
        $http.post(
            '/api/user',
            {name: name}
        ).success(function(data) {
           $location.url('/orders/' + orderCode);
        });
    };
};

var createOrder = function($scope, $http, $location) {
    $scope.submit = function(joinOrder) {
        var name = joinOrder.name;
        if (name === "" || orderCode === "") return;
        console.log(name);
        console.log(orderCode);
        // First create user and go to order page
        $http.post(
            '/api/user',
            {name: name}
        ).success(function(data) {
            return $http.post(
                    '/api/orders',
                    {hostUserId: data._id});
        }).success(function(data) {
            $location.url('/orders/' + data.code);
        });
    };
};

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


module.exports = {
    joinOrder: joinOrder,
    createOrder: createOrder,
    viewOrder: viewOrder
};
