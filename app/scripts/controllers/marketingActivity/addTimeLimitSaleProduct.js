/*
 * @Author: wuguoyuan
 * @Date:   2016-11-10 11:23:56
 * @Last Modified by:   wuguoyuan
 * @Last Modified time: 2017-02-27 17:36:11
 */

'use strict';
App.controller("addTimeLimitSaleProductController", function ($scope, ngProgressFactory, restful, $rootScope, $uibModal, toastr) {
    $scope.progressbar = ngProgressFactory.createInstance();
    $scope.data = {};
    //分页
    $scope.data.pageNum = $rootScope.PAGINATION_CONFIG.PAGEINDEX;
    $scope.data.pageSize = $rootScope.PAGINATION_CONFIG.PAGESIZE;
    $scope.maxSize= $rootScope.PAGINATION_CONFIG.MAXSIZE;
    //全选
    $scope.toggleAll = function() {
        var toggleStatus = $scope.isAllSelected;
        angular.forEach($scope.noSeckillProductData, function(item) {
            item.selected = toggleStatus;
        });
    };
    //单选
    $scope.optionToggled = function () {
      $scope.isAllSelected = $scope.noSeckillProductData.every(function (item) {
        return item.selected;
      })
        //$scope.noSeckillProductData.every(function(item) {
        //    $scope.isSeclected = false;
        //    if(item.selected){
        //        $scope.isSeclected = true;
        //        return
        //    }
        //});
    };
    //$scope.isSeclected = false;
    //加载
    $scope.query = function () {
        if(!!$scope.data.categoryName){
            $scope.data.categoryNames = angular.copy($scope.data.categoryName).split(",");
        }else{
            $scope.data.categoryNames = [];
        }
        if(!!$scope.data.prodId){
            $scope.data.prodIds = angular.copy($scope.data.prodId).split(",");
        }else {
            $scope.data.prodIds = [];
        }
        if(!!$scope.data.brandName){
            $scope.data.brandNames = angular.copy($scope.data.brandName).split(",");
        }else {
            $scope.data.brandNames = [];
        }
        $scope.progressbar.start();
        console.log("param",$scope.data)
        $scope.activityPromise = restful.fetch($rootScope.api.queryProd, "POST", $scope.data).then(function(res) {
            console.log(res)
            if(!!res.success){
                $scope.noSeckillProductData = res.model;
              $scope.total=res.query.total;
            }else {
                toastr.error(res.message,"服务器错误：");
            }
            $scope.progressbar.complete();

        }, function(rej) {
            console.log(rej);
            $scope.progressbar.complete();
            toastr.error(rej.status+"("+rej.statusText+")","请求失败：");
        });
    };
    $scope.query();
    //重置
    $scope.reset = function () {
        $scope.data = {};
        $scope.toPageNum = 1;
        $scope.data.pageNum = $rootScope.PAGINATION_CONFIG.PAGEINDEX;
        $scope.data.pageSize = $rootScope.PAGINATION_CONFIG.PAGESIZE;
    }
    // //搜索
    $scope.search = function () {
        $scope.query();
    }
    $scope.pageChanged = function () {
        $scope.query();
    };
    $scope.setPage = function () {
        $scope.data.pageNum = $scope.toPageNum;
        $scope.query();
    };
    //加入活动
    $scope.addProduct = function (items) {
        var modalInstance = $uibModal.open({
            templateUrl: 'addProduct.html',
            controller: 'addProductController',
            size: 'lg',
            resolve: {
                items: function () {
                    return items;
                }
            }
        });
        modalInstance.result.then(function () {
            //close
            $scope.query();
        }, function () {
            //$scope.query();
        })
    }
    //批量加入活动
    $scope.addAll = function (items) {
        var modalInstance = $uibModal.open({
            templateUrl: 'addAll.html',
            controller: 'addAllController',
            size: 'lg',
            resolve: {
                items: function () {
                    return items;
                }
            }

        });
        modalInstance.result.then(function () {
            //close
            $scope.query();
        }, function () {
            //$scope.query();
        })
    }
});
App.controller("addProductController", function($scope, $uibModalInstance, restful,$rootScope, $uibModal, toastr,ngProgressFactory,items,$stateParams) {
    $scope.progressbar = ngProgressFactory.createInstance();
    $scope.item = angular.copy(items);
    $scope.data = {
        activityId:$stateParams.activityId,
        prodIds:[JSON.stringify($scope.item.prodId)],
        skuList:[],
      isResetRebate:false,
      isResetMallbeanRate:false,
      isResetDistCommisRate:false
    }
  $scope.checked = function (key) {
    $scope.data[key] =!angular.copy($scope.data[key]);
  }
    $scope.data.skuList = $scope.item.skuList;
    $scope.save = function() {
        $scope.progressbar.start();
        console.log("param",$scope.data)
        restful.fetch($rootScope.api.addProduct, "POST", $scope.data).then(function(res) {
            console.log(res)
            if(!!res.success){
                toastr.success(res.message,"更新成功");
                $uibModalInstance.close('success');
            }else {
                toastr.error(res.message,"服务器提示：");
            }
            $scope.progressbar.complete();
        }, function(rej) {
            console.log(rej);
            $scope.progressbar.complete();
            toastr.error(rej.status+"("+rej.statusText+")","请求失败：");
        })
    };
    $scope.close = function() {
        $uibModalInstance.dismiss('dismiss');
    };
});
App.controller("addAllController", function($scope, $uibModalInstance, restful,$rootScope, $uibModal, toastr,ngProgressFactory,items,$stateParams) {
    //debugger
    $scope.progressbar = ngProgressFactory.createInstance();
    $scope.data = {
        activityId:$stateParams.activityId,
        prodIds:[],
        priceRate:"",
        killStock:"",
        limitAmount:"",
        isResetRebate:false,
        isResetMallbeanRate:false,
        isResetDistCommisRate:false
    }
    $scope.checked = function (key) {
        $scope.data[key] =!angular.copy($scope.data[key]);
    }
    $scope.item = angular.copy(items);
        angular.forEach($scope.item, function(item,i) {
            if (item.selected) {
                $scope.data.prodIds.push(item.prodId);
            }
            })

    $scope.selectNum = $scope.data.prodIds.length ;
  $scope.save = function() {
        $scope.progressbar.start();
        console.log("param",$scope.data)
        restful.fetch($rootScope.api.addProduct, "POST", $scope.data).then(function(res) {
            console.log(res)
            if(!!res.success){
                toastr.success(res.message,"更新成功");
                $uibModalInstance.close('success');
            }else {
                toastr.error(res.message,"服务器提示：");
            }
            $scope.progressbar.complete();
        }, function(rej) {
            console.log(rej);
            $scope.progressbar.complete();
            toastr.error(rej.status+"("+rej.statusText+")","请求失败：");
        })
    };
    $scope.close = function() {
        $uibModalInstance.dismiss('dismiss');
    };
});
