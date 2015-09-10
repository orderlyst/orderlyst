module.exports = function(module) {
    'use strict';
    module.factory("$userService", ['$http', function ($http) {
        var userDictionary = {};
        var methods = {
            fetchUserDetail: function (uid) {
                if (userDictionary[uid] !== undefined) return;
                $http.get('/api/users/' + uid)
                    .success(function (data) {
                        userDictionary[uid] = data;
                    });
            },
            fetchUserDetails: function (uids) {
                uids.map(function (uid) {
                    methods.fetchUserDetail(uid);
                });
            },
            getUserDetail: function (uid) {
                return userDictionary[uid];
            }
        };
        return methods;
    }]);
};