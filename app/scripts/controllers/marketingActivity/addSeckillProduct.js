/*
 * @Author: wuguoyuan
 * @Date:   2016-11-10 11:23:56
 * @Last Modified by:   wuguoyuan
 * @Last Modified time: 2016-11-21 16:24:51
 */

'use strict';
App.controller("seckillProductController", function ($scope, ngProgressFactory, restful, $rootScope, $uibModal, toastr,$stateParams) {
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
    };
    //加载
    $scope.query = function () {
        $scope.progressbar.start();
        console.log("param",$scope.data)
        $scope.activityPromise = restful.fetch($rootScope.api.queryProd, "POST", $scope.data).then(function(res) {
            console.log(res)
            if(!!res.success){
                $scope.noSeckillProductData = res.model;
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
    //编辑
    $scope.editseckillProduct = function (items) {
        var modalInstance = $uibModal.open({
            templateUrl: 'editseckillProduct.html',
            controller: 'editseckillProductController',
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
      miaoshaProdId: items.miaoshaProdId,
      status: -1
    };
    $scope.progressbar.start();
    console.log("param", $scope.data)
    restful.fetch($rootScope.api.updateMiaoshaProd, "POST", $scope.data).then(function (res) {
      console.log(res)
      if (!!res.success) {
        $uibModalInstance.close('success');
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
    var miaoshaProdIdArr=[];
    angular.forEach($scope.noSeckillProductData, function(item,i) {
      if (item.selected) {
        miaoshaProdIdArr.push(item.miaoshaProdId);
      }
    });
    $scope.data = {
      miaoshaProdId: miaoshaProdIdArr,
      status: -1
    };
  }
});
App.controller("editseckillProductController", function($scope, $uibModalInstance, restful,$rootScope, $uibModal, toastr,ngProgressFactory,items) {
    $scope.progressbar = ngProgressFactory.createInstance();
    $scope.item = angular.copy(items);
    $scope.save = function() {
        $scope.progressbar.start();
        console.log("param",$scope.data)
        restful.fetch($rootScope.api.updateMiaoshaProd, "POST", $scope.item).then(function(res) {
            console.log(res)
            if(!!res.success){
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
