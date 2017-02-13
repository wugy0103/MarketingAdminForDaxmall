/*
 * @Author: wuguoyuan
 * @Date:   2016-10-09 21:17:22
 * @Last Modified by:   wuguoyuan
 * @Last Modified time: 2016-10-29 18:03:40
 */

'use strict';
App.controller('HeaderController', function($scope, $state, restful, Session, msgBus) {

    msgBus.onMsg('login', $scope, function() {
        $scope.init();
    });
    $scope.init = function(){
        $scope.userName = Session.$storage.userName;
    };
    $scope.init();
    $scope.logout = function() {
            Session.destroy();
        $state.go('login');
    };
});
