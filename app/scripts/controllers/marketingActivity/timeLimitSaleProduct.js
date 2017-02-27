/*
 * @Author: wuguoyuan
 * @Date:   2016-11-10 11:23:56
 * @Last Modified by:   wuguoyuan
 * @Last Modified time: 2017-02-27 17:35:49
 */

'use strict';
App.controller("timeLimitSaleProductController", function ($scope, ngProgressFactory, restful, $rootScope, $uibModal, toastr,$stateParams,$state) {
    $scope.progressbar = ngProgressFactory.createInstance();
    $scope.data = {activityId:$stateParams.activityId,status:$stateParams.status,prodIds:[]};
    //分页
    $scope.data.pageNum = $rootScope.PAGINATION_CONFIG.PAGEINDEX;
    $scope.data.pageSize = $rootScope.PAGINATION_CONFIG.PAGESIZE;
    $scope.maxSize= $rootScope.PAGINATION_CONFIG.MAXSIZE;
    //全选
    $scope.toggleAll = function() {
        var toggleStatus = $scope.isAllSelected;
        angular.forEach($scope.TimeLimitSaleProductData, function(item) {
            item.selected = toggleStatus;
        });
    };
    //单选
    $scope.optionToggled = function () {
      $scope.isAllSelected = $scope.TimeLimitSaleProductData.every(function (item) {
        return item.selected;
      })
    };
    //加载
    $scope.query = function () {
        $scope.data.prodIds[0] = $scope.data.prodId;
        $scope.progressbar.start();
        console.log("param",$scope.data)
        $scope.activityPromise = restful.fetch($rootScope.api.queryMiaoshaProd, "POST", $scope.data).then(function(res) {
            console.log(res)
            if(!!res.success){
                $scope.TimeLimitSaleProductData = res.model;
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
        $scope.data = {status:1,actType:1};
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
  //添加
  $scope.add = function() {
      $state.go('addTimeLimitSaleProduct',{activityId:$stateParams.activityId});
  };
    //编辑
    $scope.editTimeLimitSaleProduct = function (items) {
        var modalInstance = $uibModal.open({
            templateUrl: 'editTimeLimitSaleProduct.html',
            controller: 'editTimeLimitSaleProductController',
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
  //退出活动
  $scope.del = function (items) {
    $scope.data = {
      miaoshaProdIds:[JSON.stringify(items.miaoshaProdId)],
      status: -1
    };
    $scope.progressbar.start();
    console.log("param", $scope.data)
    restful.fetch($rootScope.api.updateMiaoshaProd, "POST", $scope.data).then(function (res) {
      console.log(res)
      if (!!res.success) {
          toastr.success(res.message, "success");
          $state.go("timeLimitSale");
      } else {
          toastr.error(res.message, "服务器提示：");
      }
      $scope.progressbar.complete();
    }, function (rej) {
      console.log(rej);
      $scope.progressbar.complete();
      toastr.error(rej.status + "(" + rej.statusText + ")", "请求失败：");
    })
  }
  $scope.delAll = function () {
      $scope.data = {
          miaoshaProdIds:[],
          status: -1
      };
    angular.forEach($scope.TimeLimitSaleProductData, function(item,i) {
      if (item.selected) {
          $scope.data.miaoshaProdIds.push(item.miaoshaProdId);
      }
    });
      $scope.progressbar.start();
      console.log("param", $scope.data)
      restful.fetch($rootScope.api.updateMiaoshaProd, "POST", $scope.data).then(function (res) {
          console.log(res)
          if (!!res.success) {
              toastr.success(res.message, "success");
              $state.go("timeLimitSale");
          } else {
              toastr.error(res.message, "服务器提示：");
          }
          $scope.progressbar.complete();
      }, function (rej) {
          console.log(rej);
          $scope.progressbar.complete();
          toastr.error(rej.status + "(" + rej.statusText + ")", "请求失败：");
      })
  }
});
//编辑
App.controller("editTimeLimitSaleProductController", function($scope, $uibModalInstance, restful,$rootScope, $uibModal, toastr,ngProgressFactory,items) {
    $scope.progressbar = ngProgressFactory.createInstance();
    $scope.item = angular.copy(items);
    $scope.save = function() {
        $scope.data= {
            killPrice:$scope.item.killPrice,
            limitAmount:$scope.item.limitAmount,
            miaoshaProdIds:[JSON.stringify($scope.item.miaoshaProdId)],
            skuList:$scope.item.skuList
        };
        $scope.progressbar.start();
        console.log("param",$scope.data)
        restful.fetch($rootScope.api.updateMiaoshaProd, "POST", $scope.data).then(function(res) {
            console.log(res)
            if(!!res.success){
                $uibModalInstance.close('success');
                toastr.success(res.message,"success");
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
