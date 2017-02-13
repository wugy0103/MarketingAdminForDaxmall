/**
 * Created by wugy on 2016/12/28.
 */
'use strict';
App.controller('UserLoginController', function($scope, $rootScope, $state, AuthService, Session, msgBus) {
	//初始时将之前登录过的信息清空
	$scope.load = function() {
		Session.destroy();
	};
	$scope.credentials = {
		username: '',
		password: '',
	};
	$scope.error = "";

	$scope.login = function(credentials) {
		console.log(credentials);
		$scope.loginPromise = AuthService.login(credentials).then(function(data) {
			if (!!data.success) {
				msgBus.emitMsg("login");
				$state.go('dashboard');
			} else {
				$scope.error = data.message || "超时";
			}
		});

	};


});
