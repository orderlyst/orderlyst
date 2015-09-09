var joinOrder = function($scope, $http, $location) {
    $scope.submit = function(joinOrder) {
        var name = joinOrder.name;
        var orderCode = joinOrder.code;
        if (name == "" || orderCode == "") return;
        // First create user
        $http.post(
            '/api/user',
            {name: name}
        ).success(function(data) {
           $location.url('/orders/' + orderCode);
        });

    };
};

module.exports = {
    joinOrder: joinOrder
}