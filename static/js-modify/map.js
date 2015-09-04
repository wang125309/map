require("../../bower_components/zepto/zepto.js");
require("../../bower_components/zeptojs/src/touch.js");
require("../../bower_components/velocity/velocity.min.js");
require("../../bower_components/angular/angular.js")
require("../../bower_components/angular-touch/angular-touch.js")
require("../../bower_components/angular-animate/angular-animate.js")

mapCtrl = angular.module('app',['ngTouch','ngAnimate']).controller('mapCtrl',['$scope',function($scope){
    w = $(window).width();
    h = $(window).height();

    var map = new BMap.Map("map");
    getQueryResult = function(search) {
        $scope.res = [];      
        var local = new BMap.LocalSearch(map,{
            onSearchComplete : function(results) {
                for(i in results.Uq) {
                    a = { 
                        "title" :results.Uq[i].title,
                        "address" :results.Uq[i].address,
                        "point":results.Uq[i].point
                    };
                    $scope.res.push(a);
                    $scope.$apply();
                }
            }
        });
        if(search.length) local.search(search);
    };
    $scope.backMap = function() {
        $scope.searchBackground = false;
    };
    $scope.fixTo = function(point) {
        var p = new BMap.Point(point.lng,point.lat);
        map.centerAndZoom(p,17);
        $scope.search();
        var geo = new BMap.Geocoder();
        geo.getLocation(p,function(result){
            if(result) {
                $scope.address = result.address;
                $scope.$apply();
            } 
        });
    };
    $scope.resultShow = false;
    $scope.address = '定位中...';
    $scope.searchBackground = false;
    $scope.search = function() {
        if($scope.searchBackground == false) {
            $scope.searchBackground = true;
        }
        else {
            $scope.searchBackground = false;
        }
    };
    $scope.messageShow = false;
    var lng,lat,me;
    $scope.goBack = function() {
        map.centerAndZoom(me,17);
    };
    $scope.positionPress = false;
    $scope.position_press = function() {
        if($scope.positionPress == false) {
            $scope.positionPress = true;
            var geo = new BMap.Geocoder();
            geo.getLocation(me,function(result){
                if(result) {
                    $("#address-input").val(result.address);
                } 
            });

            setTimeout(function(){
                $scope.positionPress = false;
                $scope.$apply();
            },1000);
        }
    };
    var handleSuccess = function(position) {
        lng = position.coords.longitude;
        lat = position.coords.latitude;
        //lat = 40.07674194573888;
        //lng = 116.41599579202051;
        var point = new BMap.Point(lng,lat);
        map.centerAndZoom(point,17);
        map.addControl(new BMap.NavigationControl());
        //FIXME

        translateCallback = function(data) {
            if(data.status == 0) {
                var marker = new BMap.Marker(data.points[0]);
                map.addOverlay(marker);
                map.setCenter(data.points[0]);
                me = data.points[0];
                var geo = new BMap.Geocoder();
                geo.getLocation(data.points[0],function(result){
                    if(result) {
                        $scope.address = result.address;
                        $scope.$apply();
                    } 
                });
            }
        }
        var convertor = new BMap.Convertor();
        var pointArr = [];
        pointArr.push(point);
        convertor.translate(pointArr,1,5,translateCallback);
    }
    var handleError = function() {
        
    }
    if(window.navigator.geolocation) {
        var options = {
            enableHighAccuracy:true,
        }
        window.navigator.geolocation.getCurrentPosition(handleSuccess,handleError,options);
    }
    else {
        alert("浏览器定位失败");
    }

    $scope.filter = {
        show : function() {
            if (this.status == false) {
                this.status = true;
                return true;
            }
            else {
                this.status = false;
                return false;
            }
        },
        status : false,
    }
}])
.directive('input',function(){
    return {
        link : function(scope, element, attr) {
            element.bind('keyup',function(){
                if(element.val().length) {
                    getQueryResult(element.val());
                    scope.resultShow = true;
                    scope.$apply();
                }
                else {
                    scope.resultShow = false;
                    scope.$apply();
                }
            });
        }
    } 
});

mapCtrl.$inject = ['$scope','mapCtrl']; 