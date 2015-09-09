var joinOrder = function($scope, $http, $location) {
    $scope.submit = function(joinOrder) {
        var name = joinOrder.name;
        var orderCode = joinOrder.code;
        if (name === "" || orderCode === "") return;
        console.log(name);
        console.log(orderCode);
        // First create user and go to order page
        $http.post(
            '/api/users',
            {name: name}
        ).success(function(data) {
           $location.url('/orders/' + orderCode);
        });
    };
};

joinOrder.$inject = ['$scope', '$http', '$location'];

var createOrder = ['$scope', '$http', '$location', '$store',
    function($scope, $http, $location, $store) {
    $scope.createOrder = {};
    $store.bind($scope, 'test', 'Some Default Text');
    $scope.submit = function() {
        var name = $scope.createOrder.name;
        if (name === "") return;
        console.log(name);
        // First create user and go to order page
        $http.post(
            '/api/users',
            {name: name}
        ).success(function(data) {
            return $http.post(
                    '/api/orders',
                    {hostUserId: data._id});
        }).success(function(data) {
            $location.url('/orders/' + data._id);
        });
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
