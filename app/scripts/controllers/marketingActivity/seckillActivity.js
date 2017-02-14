/*
 * @Author: wuguoyuan
 * @Date:   2016-11-10 11:23:56
 * @Last Modified by:   wuguoyuan
 * @Last Modified time: 2016-11-21 16:24:51
 */

'use strict';
App.controller("seckillActivityController", function ($scope, ngProgressFactory, restful, $rootScope, $uibModal, toastr,$sce) {
    $scope.progressbar = ngProgressFactory.createInstance();
    $scope.data = {};
    $scope.zhuangtai1 = [{
        stauts: "海外订单",
        status_id: "O"
    }, {
        stauts: "国内订单",
        status_id: "N"
    }];
    $scope.zhuangtai2 = [{
        stauts: "未付款",
        status_id: "1"
    }, {
        stauts: "待发货",
        status_id: "2"
    }, {
        stauts: "已发货",
        status_id: "3"
    }, {
        stauts: "交易成功",
        status_id: "4"
    }, {
        stauts: "交易失败",
        status_id: "5"
    }];
    $scope.zhuangtai3 = [{
        stauts: "正常订单",
        status_id: "N"
    }, {
        stauts: "定金",
        status_id: "D"
    }, {
        stauts: "尾款",
        status_id: "F"
    }];
    //分页
    $scope.data.pageNum = $rootScope.PAGINATION_CONFIG.PAGEINDEX;
    $scope.data.pageSize = $rootScope.PAGINATION_CONFIG.PAGESIZE;
    $scope.maxSize= $rootScope.PAGINATION_CONFIG.MAXSIZE;
    //url安全转义
    $scope.sce = {
        exportUrl: $sce.trustAsResourceUrl($rootScope.api.getLsSubexp),
    }
    //时间转时间戳
    $scope.OnSetTime = function (time) {
        $scope.data[time] = new Date($scope[time]).getTime();
    }
    //加载
    $scope.query = function () {
        $scope.progressbar.start();
        console.log("param",$scope.data)
        $scope.orderPromise = restful.fetch($rootScope.api.getLsSublist, "POST", $scope.data).then(function(res) {

            console.log(res)
            if(!!res.success){
                $scope.orderData = res;
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
        $scope.startDate=$scope.data.startDate;
        $scope.endDate=$scope.data.startDate;
        $scope.finishPayStartDate=$scope.data.startDate;
        $scope.finishPayEndDate=$scope.data.startDate;
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
    $scope.orderListDetails = function(items) {
        var modalInstance = $uibModal.open({
            templateUrl: 'orderListDetails.html',
            controller: 'orderListDetailsController',
            size: "lg",
            resolve: {
                items: function() {
                    return items;
                }
            },
        });
    }
});
//举报内容
App.controller("orderListDetailsController", function ($scope, $uibModalInstance, items) {
    $scope.item = items;
    $scope.close = function () {
        $uibModalInstance.dismiss('close');
    };
});
