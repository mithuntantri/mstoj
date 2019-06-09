(function() {
    'use strict';

    angular
        .module('app')
        .controller('DashboardController', DashboardController);

    DashboardController.$injector = ['$scope', '$rootScope', '$location', '$nativeDrawer', '$timeout', 'Login', 'User'];

    function DashboardController($scope, $rootScope, $location, $nativeDrawer, $timeout, Login, User){
        StatusBar.backgroundColorByHexString('#f09819');
        StatusBar.styleLightContent();
    	
        console.log('DashboardController')
    	$rootScope.drawer = $nativeDrawer;
        $scope.User = User

        $scope.name = localStorage.getItem('name')
        console.log($scope.name)

        let name = document.getElementById('name')
        if(name){
            name.innerHTML = $scope.name            
        }

        console.log($scope.User)

        $scope.showDashboard = true
        $scope.showCategoryWise = false
        $scope.showLocationWise = false

        $scope.showDashboardEmpty = false
        $scope.showCategoryWiseEmpty = false
        $scope.showLocationWiseEmpty = false
        /**
        * Sets the donut svg component value
        */
        function setDonutValue(donut, value){
            if( !donut || !value || value < 0 || value > 100 )
                return false;

            var circleFront = donut.querySelector('.circle-front'),
                radius = circleFront.r.baseVal.value,
                dasharray   = 2 * Math.PI * radius;

            circleFront.style.strokeDashoffset = dasharray * (1 - (value/100)) + 'px';
            task.run( DOM.donutValue, value );
        }


        /**
        * Count to value
        */
        var task = {
          run : function( elm, toValue ){
            this.elm          = elm;
            this.initialValue = this.elm.innerHTML|0;
            this.toValue      = toValue;
            this.delta        = this.toValue - this.initialValue;
            
            this.doin = this.doin || new Doin({
              step     : this.step.bind(this),
              duration : 1
            })
            this.doin.start();
          },
                          
          easing : function (t) { return t*(2-t) },
            
          step : function(t){
            t = task.easing(t);

            // calculate new value
            var value = this.delta * t + this.initialValue;

            // limit value
            if( t > 0.999 )
                value = this.toValue;

            // print value on each step (using bitwise to round the integer so it won't be Float)
            this.elm.innerHTML = (value|0).toLocaleString(); //  this.nf.format(value|0);
          },
        }

        /**
        * Component DOM elements
        */
        var DOM = {};
        DOM.donut = document.querySelector('.donutChart');
        if(DOM.donut)
            DOM.donutValue = DOM.donut.querySelector('.value');


        /**
        * Pick a random value for the donut every N seconds
        */
        function setRandomValue(){
          var randomValue = parseInt(Math.floor(User.DashboardDetails.actuals / User.DashboardDetails.target * 100))
          setDonutValue( DOM.donut, randomValue );
        }

        if(!User.DrillDownDetails){
            setTimeout(setRandomValue, 500)            
        }

        $timeout(()=>{
            $scope.showDrillDown = true
        },1000)

        $scope.drilldown = (type, level, param1, param2, param2_name)=>{
            console.log(type, level, param1, param2, param2_name, User.DrillDownDetails)
                User.DrillDownDetails = null
                $location.url('/drilldown')
                let code=localStorage.getItem('username').toUpperCase().split("MSDI")[1]
                User.getAdminDashboard(code, type, level, param1, param2).then((result)=>{
                    if(result.data.status){
                        User.DrillDownDetails = {
                            'type': type,
                            'level': level,
                            'param1': param1,
                            'param2': param2,
                            'param2_name': param2_name,
                            'result': null
                        }
                        User.DrillDownDetails.result = _.sortBy(result.data.data, (x)=>{return x.target-x.actuals}).reverse()
                        console.log('final drilldown', User.DrillDownDetails.result)
                        $scope.showDrillDown = true
                    }else{
                        $scope.showDrillDownEmpty = true
                    }
                }).catch(()=>{
                    $scope.showDrillDownEmpty = true
                })    
        }

        $scope.goBack = ()=>{
            console.log("goback", User.DrillDownDetails)
            if(!User.DrillDownDetails){
                $location.url('/dashboard')
                $scope.currentTab = localStorage.getItem('currentTab')?localStorage.getItem('currentTab'):'dashboard'
                $scope.getTab($scope.currentTab)
                $scope.$apply()
                // window.location.reload(); 
            }else if(User.DrillDownDetails.level == 1){
                $location.url('/dashboard')
                $scope.currentTab = localStorage.getItem('currentTab')?localStorage.getItem('currentTab'):'dashboard'
                $scope.getTab($scope.currentTab)
                $scope.$apply()
                // window.location.reload(); 
            }else if(User.DrillDownDetails.level == 2){
                $scope.drilldown(User.DrillDownDetails.type, User.DrillDownDetails.level-1, User.DrillDownDetails.param1, '', '')
                User.DrillDownDetails.level = User.DrillDownDetails.level-1
            }
        }

        $scope.getTab = (type)=>{
            localStorage.setItem('currentTab', type)
            // document.getElementById('dashboardtab').classList.remove('active')
            // document.getElementById('categorywisetab').classList.remove('active')
            // document.getElementById('locationwisetab').classList.remove('active')

            let code=localStorage.getItem('username').toUpperCase().split("MSDI")[1]
            if(type == 'dashboard'){
                // document.getElementById('dashboardtab').classList.add('active')
                $scope.showDashboard = false
                User.getAdminDashboard(code, 'dashboard', 0, '', '').then((result)=>{
                    if(result.data.status){
                        $scope.dashboard = result.data.data.dashboard
                        $scope.requests = result.data.data.requests
                        $scope.dashboard = _.map($scope.dashboard, function(element) {
                            var treasure = _.findWhere($scope.requests, { request_iws_code: element.iws_code, request_product_id: element.product_id });

                            return _.extend(element, treasure);
                        });
                        console.log("DashboardDetails", $scope.dashboard, $scope.requests)
                        $scope.dashboardCategories = _.groupBy($scope.dashboard, 'iws_category')
                        console.log($scope.dashboardCategories)
                        $scope.showDashboard = true
                        User.DashboardDetails = result.data.data
                    }else{
                        $scope.showDashboardEmpty = true
                    }
                }).catch(()=>{
                    $scope.showDashboardEmpty = true
                })
            }else if(type == 'categorywise'){
                // document.getElementById('categorywisetab').classList.add('active')
                $scope.showCategoryWise = false
                User.getAdminDashboard(code, 'category', 0, '', '').then((result)=>{
                    if(result.data.status){
                        User.CategoryWiseDetails = _.sortBy(result.data.data, (x)=>{return x.target-x.actuals}).reverse()
                        $scope.showCategoryWise = true
                    }else{
                        $scope.showCategoryWiseEmpty = true
                    }
                }).catch(()=>{
                    $scope.showCategoryWiseEmpty = true
                })
            }else if(type == 'locationwise'){
                // document.getElementById('locationwisetab').classList.add('active')
                $scope.showLocationWise = false
                User.getAdminDashboard(code, 'location', 0, '', '').then((result)=>{
                    if(result.data.status){
                        User.LocationWiseDetails = _.sortBy(result.data.data, (x)=>{return x.target-x.actuals}).reverse()
                        $scope.showLocationWise = true
                    }else{
                        $scope.showLocationWiseEmpty = true
                    }
                }).catch(()=>{
                    $scope.showLocationWiseEmpty = true
                })
            }
        }

        $scope.logout = ()=>{
            localStorage.removeItem('token')
            localStorage.removeItem('name')
            localStorage.removeItem('username')
            localStorage.removeItem('admin_type')
            $location.url('/')
        }

        $scope.openNotifications = ()=>{
            $location.url('/notifications')
            $scope.$apply()
        }

        $scope.currentTab = localStorage.getItem('currentTab')?localStorage.getItem('currentTab'):'dashboard'
        console.log("$scope.currentTab", $scope.currentTab)

        $scope.getTab('dashboard')

        $scope.openResult = false
        $scope.showIWSDetails = false
        $scope.searchInput = null
        $scope.searchResult = []

        $scope.startSearch = ()=>{
            console.log($scope.searchInput)
            $scope.searchResult = []
            User.getSearchResults($scope.searchInput).then((result)=>{
                $scope.searchResult = result.data.data
            }).catch((err)=>{

            })
        }

        $scope.IWSDetails = {
            products : [],
            loc_code: null,
            data: null
        }

        $scope.openIWS = (index)=>{
            User.getIWSDetails($scope.searchResult[index].iws_code).then((result)=>{
                $scope.IWSDetails.products = result.data.data
                $scope.IWSDetails.loc_code = result.data.data[0].loc_code
                $scope.IWSDetails.data = $scope.searchResult[index]
                $scope.showIWSDetails = true
            })
        }
    }
})()