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


module.exports = {
    joinOrder: joinOrder,
    createOrder: createOrder
};
