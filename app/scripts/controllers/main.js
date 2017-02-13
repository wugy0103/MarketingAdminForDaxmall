/**
 * Created by wugy on 2016/12/28.
 */
'use strict';

App.controller('MainController',['$scope', '$state', 'AuthService', function($scope, $state, AuthService) {
  if (!AuthService.isAuthorized('dashboard')){
    $state.go('login');
  }
}]);
