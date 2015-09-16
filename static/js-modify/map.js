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
        $scope.changeCityShow = false;
        $(".second-view").removeClass("changeToCity");
    };
    $scope.fixTo = function(point) {
        var p = new BMap.Point(point.lng,point.lat);
        map.centerAndZoom(p,17);
        $scope.search();
        $scope.searchBackground = false;
        var geo = new BMap.Geocoder();
        geo.getLocation(p,function(result){
            if(result) {
                $.get("/tradecenter/api/map/list?lng="+result.point.lng+"&lat="+result.point.lat,function(data){
                    $scope.list = data.list;
                    ms = [];
                    for (i in data.list) {
                        lng = data.list[i].lng;
                        lat = data.list[i].lat;
                        if (data.list[i].allowCoupon == 1 && data.list[i].suitable == 0) {
                            icon = new BMap.Icon("/static/image/set-icon-blue.png",new BMap.Size(66,58));
                        }
                        else if(data.list[i].allowCoupon == 0 && data.list[i].suitable == 0){
                            icon = new BMap.Icon("/static/image/set-icon-red.png",new BMap.Size(45,58));
                        }
                        else {
                            icon = new BMap.Icon("/static/image/set-icon-uni.png",new BMap.Size(88,58));
                        }
                        var p = new BMap.Point(lng,lat);
                        var m = new BMap.Marker(p,{
                            icon:icon
                        });
                        ms.push(m);

                    }
                    for (m in ms) {
                        ms[m].addEventListener("click",function(e){
                            c = getNearestPoint(data.list,e.point.lng,e.point.lat);
                            $scope.shopid = data.list[c].shopid;
                            $scope.orgName = data.list[c].orgName;
                            $scope.courseName = data.list[c].courseName;
                            $scope.priceSale = data.list[c].priceSale;
                            $scope.logo = data.list[c].logo;
                            $scope.suitable = data.list[c].suitable;
                            $scope.pricePromise = data.list[c].pricePromise;
                            $scope.allowCoupon = data.list[c].allowCoupon;
                            $scope.type = data.list[c].type;
                            $scope.messageShow = true;
                            $scope.$apply();
                        });
                        map.addOverlay(ms[m]);
                    }
                });
                $scope.city = result.addressComponents.city;
                $scope.address= result.address;
                $scope.$apply();
            } 
        });
    };
    $scope.changeCityShow = false;
    $scope.citys = window.tags.citys;
    $scope.changeCity = function() {
        $(".second-view").addClass("changeToCity");
        $scope.changeCityShow = true;
        $scope.searchBackground = false;
    };
    console.log(window.tags.citys);
    $scope.resultShow = false;
    $scope.address = '定位中...';
    $scope.searchBackground = false;
    $scope.search = function() {
        if($scope.searchBackground == false) {
            $(".first-view").addClass("first-view-animation");
            $scope.searchBackground = true;
            $scope.changeCityShow = false;
        }
    };
    $scope.backSearch = function() {
        $scope.searchBackground = true;
        $scope.changeCityShow = false;
    };
    $scope.messageShow = false;
    var lng,lat,me;
    $scope.goBack = function() {
        map.centerAndZoom(me,17);
    };
    $scope.changeTo = function(city) {
        $scope.changeCityShow = false;
        $scope.searchBackground = true;
        $scope.city = city;
    };
    $scope.tags = window.tags.subjects;
    $scope.hots = window.tags.hot_subjects;
    console.log(tags);
    $scope.positionPress = false;
    $scope.position_press = function() {
        if($scope.positionPress == false) {
            var geo = new BMap.Geocoder();
            geo.getLocation(me,function(result){
                if(result) {
                    $("#address-input").val(result.address);
                } 
            });
        }
    };
    var getNearestPoint = function(map,lng,lat) {
        d = 100000000000.0;
        min = 0;
        for (i in map) {
            l = (map[i].lng - lng)*(map[i].lng - lng) + (map[i].lat - lat)*(map[i].lat - lat);
            if (l < d) {
                d = l;
                min = i;
            }
        }
        return min;
    };
    var handleSuccess = function(position) {
        lng = position.coords.longitude;
        lat = position.coords.latitude;
        //lng = 123.444745;
        //lat = 41.798247;

        var point = new BMap.Point(lng,lat);
        map.centerAndZoom(point,15);
        map.addControl(new BMap.NavigationControl());
        //FIXME using native coords

        translateCallback = function(data) {
            if(data.status == 0) {
                myIcon = new BMap.Icon("/static/image/set-icon-my.png",new BMap.Size(30,33));
                var marker = new BMap.Marker(data.points[0],{
                    icon:myIcon
                });
                map.addOverlay(marker);
                map.setCenter(data.points[0]);
                me = data.points[0];
                var geo = new BMap.Geocoder();
                geo.getLocation(data.points[0],function(result){
                    if(result) {
                        result.point.lng = lng;
                        result.point.lat = lat;
                        $.get("/tradecenter/api/map/list?lng="+result.point.lng+"&lat="+result.point.lat,function(data){
                            $scope.list = data.list;
                            ms = [];
                            for (i in data.list) {
                                lng = data.list[i].lng;
                                lat = data.list[i].lat;
                                if (data.list[i].allowCoupon == 1 && data.list[i].suitable == 0) {
                                    icon = new BMap.Icon("/static/image/set-icon-blue.png",new BMap.Size(66,58));
                                }
                                else if(data.list[i].allowCoupon == 0 && data.list[i].suitable == 0){
                                    icon = new BMap.Icon("/static/image/set-icon-red.png",new BMap.Size(45,58));
                                }
                                else {
                                    icon = new BMap.Icon("/static/image/set-icon-uni.png",new BMap.Size(88,58));
                                }
                                var p = new BMap.Point(lng,lat);
                                var m = new BMap.Marker(p,{
                                    icon:icon
                                });
                                ms.push(m);
                                
                            }
                            for (m in ms) {
                                ms[m].addEventListener("click",function(e){
                                    c = getNearestPoint(data.list,e.point.lng,e.point.lat);
                                    $scope.shopid = data.list[c].shopid;
                                    $scope.orgName = data.list[c].orgName;
                                    $scope.courseName = data.list[c].courseName;
                                    $scope.priceSale = data.list[c].priceSale;
                                    $scope.logo = data.list[c].logo;
                                    $scope.suitable = data.list[c].suitable;
                                    $scope.pricePromise = data.list[c].pricePromise;
                                    $scope.allowCoupon = data.list[c].allowCoupon;
                                    $scope.type = data.list[c].type;
                                    $scope.messageShow = true;
                                    $scope.$apply();
                                });
                                map.addOverlay(ms[m]);
                            }
                        });
                        $scope.city = result.addressComponents.city;
                        $scope.address= result.address;
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
