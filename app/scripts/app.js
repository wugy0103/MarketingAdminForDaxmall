/**
 * Created by wugy on 2016/12/28.
 */

'use strict';
var App, modules;
modules = ['ui.router', 'ngSanitize', 'ngProgress', 'ui.select', 'angularPromiseButtons', 'AdminFilters','AdminService', 'ngStorage', 'angular-confirm', 'toastr','ui.bootstrap','ui.bootstrap.datetimepicker'];
App = angular.module('MarketingAdminForDaxmall', modules);
//路由配置
App.config(function($stateProvider, $urlRouterProvider,$locationProvider,$qProvider) {
    $locationProvider.hashPrefix('');//新的ngRoute中默认的路由分割符号是#!，已经不是#了,这句话就是用回#。
    $qProvider.errorOnUnhandledRejections(false);//解决新的ngRoute 报错Possibly unhandled rejection: {}
    $urlRouterProvider.otherwise('/User/Login');
    $stateProvider.state('dashboard', {
            url: '/',
            templateUrl: 'views/main.html'
        })
        .state('login', {
            url: '/User/Login',
            templateUrl: 'views/User/Login.html'
        })
        //营销模块-》秒杀
        .state('seckillActivity', {
            url: '/marketingActivity/seckillActivity',
            templateUrl: 'views/marketingActivity/seckillActivity.html',
            controller:function($rootScope){
                $rootScope.title="秒杀活动";
            }
        })
        //营销模块-》秒杀商品
        .state('seckillProduct', {
            params: {
              'activityId': null,
              'status':null
            },
            url: '/marketingActivity/seckillProduct',
            templateUrl: 'views/marketingActivity/seckillProduct.html',
            controller:function($rootScope){
                $rootScope.title="秒杀商品列表";
            }
        })
        //营销模块-》新增秒杀商品
        .state('addSeckillProduct', {
            params: {
                'activityId': null
            },
            url: '/marketingActivity/addSeckillProduct',
            templateUrl: 'views/marketingActivity/addSeckillProduct.html',
            controller:function($rootScope){
                $rootScope.title="新增秒杀商品";
            }
        })
        //营销模块-》限时特价
        .state('timeLimitSale', {
            url: '/marketingActivity/timeLimitSale',
            templateUrl: 'views/marketingActivity/timeLimitSale.html',
            controller:function($rootScope){
                $rootScope.title="限时特价";
            }
        })
        .state('timeLimitSaleProduct', {
            params: {
                'activityId': null,
                'status':null
            },
            url: '/marketingActivity/timeLimitSaleProduct',
            templateUrl: 'views/marketingActivity/timeLimitSaleProduct.html',
            controller:function($rootScope){
                $rootScope.title="限时特价商品列表";
            }
        })
        .state('addTimeLimitSaleProduct', {
            params: {
                'activityId': null
            },
            url: '/marketingActivity/addTimeLimitSaleProduct',
            templateUrl: 'views/marketingActivity/addTimeLimitSaleProduct.html',
            controller:function($rootScope){
                $rootScope.title="新增限时特价商品";
            }
        })

});

//promise 按钮
App.config(function(angularPromiseButtonsProvider) {
    angularPromiseButtonsProvider.extendConfig({
        spinnerTpl: '<i class="fa fa-spinner" aria-hidden="true"></i>',
        disableBtn: true,
        btnLoadingClass: 'is-loading',
        addClassToCurrentBtnOnly: false,
        disableCurrentBtnOnly: false
    });
});

//toast 对话框
App.config(function(toastrConfig) {
    angular.extend(toastrConfig, {
        autoDismiss: false,
        containerId: 'toast-container',
        maxOpened: 0,
        timeOut: 3000,
        newestOnTop: true,
        positionClass: 'toast-top-right',
        preventDuplicates: false,
        preventOpenDuplicates: false,
        target: 'body'
    });
});

// http拦截器
App.config(function($httpProvider) {
    $httpProvider.interceptors.push([
        '$injector',
        function($injector) {
            return $injector.get('AuthInterceptor');
        }
    ]);
});

//监控路由变化
App.run(function($state, $rootScope, AuthService) {
    $rootScope.$on('$stateChangeStart', function(event, toState) {
        //判断是否是不包括头部和侧栏的页面
        $rootScope.isOwnPage = _.contains(["login"], toState.name);
        //路由拦截，无权限则跳转到登录界面
        var nextRoute = toState.name;
        //console.log(nextRoute)
        if (!AuthService.isAuthorized(nextRoute) && !$rootScope.isOwnPage && toState.name != "dashboard") {
            event.preventDefault(); //阻止页面跳转\
            $state.go('login');
        }
    });
});
