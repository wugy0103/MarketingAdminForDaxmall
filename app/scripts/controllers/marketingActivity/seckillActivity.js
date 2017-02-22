/*
 * @Author: wuguoyuan
 * @Date:   2016-11-10 11:23:56
 * @Last Modified by:   wuguoyuan
 * @Last Modified time: 2016-11-21 16:24:51
 */

'use strict';
App.controller("seckillActivityController", function ($scope, ngProgressFactory, restful, $rootScope, $uibModal, toastr) {
    $scope.progressbar = ngProgressFactory.createInstance();
    $scope.data = {status:1,actType:0};
    $scope.zhuangtai2 = [{
        stauts: "已过期",
        status_id: "2"
    },{
        stauts: "已上线",
        status_id: "1"
    },  {
        stauts: "待编辑",
        status_id: "0"
    }, {
        stauts: "已删除",
        status_id: "-1"
    }];
    //分页
    $scope.data.pageNum = $rootScope.PAGINATION_CONFIG.PAGEINDEX;
    $scope.data.pageSize = $rootScope.PAGINATION_CONFIG.PAGESIZE;
    $scope.maxSize= $rootScope.PAGINATION_CONFIG.MAXSIZE;
    //时间转时间戳
    $scope.OnSetTime = function (time) {
        $scope.data[time] = new Date($scope[time]).getTime();
    }
    //加载
    $scope.query = function () {
        $scope.progressbar.start();
        console.log("param",$scope.data)
        $scope.activityPromise = restful.fetch($rootScope.api.queryActivity, "POST", $scope.data).then(function(res) {
            console.log(res)
            if(!!res.success){
                $scope.activityData = res;
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
        $scope.data = {status:1,actType:0};
        $scope.activityStartDate=$scope.data.activityStartDate;
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
    var modalInstance = $uibModal.open({
      templateUrl: 'addActivity.html',
      controller: 'addActivityController',
      size: 'lg'
    });
    modalInstance.result.then(function() {
      //close
      $scope.data = {status:0,actType:0};
      $scope.query();
    }, function () {
        //$scope.query();
    })
  };
    //编辑
    $scope.editActivity = function (items) {
        var modalInstance = $uibModal.open({
            templateUrl: 'editActivity.html',
            controller: 'editActivityController',
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
    $scope.activityListDetails = function(items) {
        var modalInstance = $uibModal.open({
            templateUrl: 'activityListDetails.html',
            controller: 'activityListDetailsController',
            size: "lg",
            resolve: {
                items: function() {
                    return items;
                }
            },
        });
    }
});
//添加
App.controller("addActivityController", function($scope, $uibModalInstance, restful,$rootScope, $uibModal, toastr,ngProgressFactory) {
    $scope.progressbar = ngProgressFactory.createInstance();
    $scope.data = {actType:0};//0-秒杀 1-限时特卖
    //时间转时间戳
    $scope.OnSetTime = function (time) {
        $scope.data[time] = new Date($scope[time]).getTime();
    }
    $scope.save = function() {
        $scope.progressbar.start();
        console.log("param",$scope.data)
        restful.fetch($rootScope.api.saveActivity, "POST", $scope.data).then(function(res) {
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
App.controller("editActivityController", function($scope, $uibModalInstance, restful,$rootScope, $uibModal, toastr,ngProgressFactory,items) {
    $scope.progressbar = ngProgressFactory.createInstance();
    $scope.data = {actType:0,activityId:items.activityId};
    $scope.item = items;

    //时间转时间戳
    $scope.OnSetTime = function (time) {
        $scope.data[time] = new Date($scope.item[time]).getTime();
        console.log(new Date($scope.item[time]).getTime());
    }
    $scope.OnSetTime("startDate")
    $scope.save = function() {
        $scope.progressbar.start();
        console.log("param",$scope.data)
        restful.fetch($rootScope.api.saveActivity, "POST", $scope.data).then(function(res) {
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
//举报内容
App.controller("activityListDetailsController", function ($scope, $uibModalInstance, items) {
    $scope.item = items;
    $scope.close = function () {
        $uibModalInstance.dismiss('close');
    };
});
