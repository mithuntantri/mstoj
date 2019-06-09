(function() {
    'use strict';

    angular
        .module('app')
        .controller('DashboardController', DashboardController);

    DashboardController.$injector = ['$scope', '$rootScope', '$nativeDrawer', '$timeout', 'Login', 'User', '$location', '$window'];

    function DashboardController($scope, $rootScope, $nativeDrawer, $timeout, Login, User, $location, $window){
        StatusBar.backgroundColorByHexString('#f09819');
        StatusBar.styleLightContent();
    	
        console.log('DashboardController')
    	$rootScope.drawer = $nativeDrawer;
        $scope.User = User

        console.log($scope.User)

        $scope.resetToggle = ()=>{
            _.each($scope.User.Targets, (targets)=>{
                targets.selected = false
            })   
        }

        $scope.openProduct = (index)=>{
            $scope.resetToggle()
            $scope.User.Targets[index].selected = true
        }

        $scope.toggleProduct = (index)=>{
            console.log('toggleProduct', index)
            $scope.User.Targets[index].selected = !$scope.User.Targets[index].selected
        }

        if($scope.User.Targets.length > 0)
            $scope.openProduct(0)

        var options = {
            maxWidth: 300,
            speed: 0.2,
            animation: 'ease-out',
            topBarHeight: 56,
            modifyViewContent: true,
            useActionButton: true
        }

        $rootScope.drawer.init( options );

    	$rootScope.title = 'TICKETS OF JOY'

        $scope.openRequestParts = (index1, index2)=>{
            if(!index2){
                if($scope.expanded_targets[index1].target_quantity == $scope.expanded_targets[index1].availed_quantity){
                    User.request.selectedIndex1 = index1
                    User.request.selectedIndex2 = index2
                    User.request.selectedProduct = $scope.expanded_targets[index1].product_category
                    User.request.selectedProductID = $scope.expanded_targets[index1].product_id
                    $scope.current_modal = 'request-parts'
                    $('#lab-slide-bottom-popup-request-parts').modal().show();
                }else{
                    showBottom('Cannot request for more for this category of parts')
                }
            }else{
                if(User.Targets[index1].data[index2].target_quantity == User.Targets[index1].data[index2].availed_quantity){
                    User.request.selectedIndex1 = index1
                    User.request.selectedIndex2 = index2
                    User.request.selectedProduct = User.Targets[User.request.selectedIndex1].data[User.request.selectedIndex2].product_category
                    User.request.selectedProductID = User.Targets[User.request.selectedIndex1].data[User.request.selectedIndex2].product_id
                    $scope.current_modal = 'request-parts'
                    $('#lab-slide-bottom-popup-request-parts').modal().show();
                }else{
                    showBottom('Cannot request for more for this category of parts')
                }
            }
            
        }

        $scope.openProfile = ()=>{
            $('#lab-slide-bottom-popup-profile').modal().show();
        }

        $scope.closeRequestModal = ()=>{
            $('#lab-slide-bottom-popup-request-parts').modal().hide();
        }

        $scope.closeProfileModal = ()=>{
            $('#lab-slide-bottom-popup-profile').modal().hide();
        }

        function showBottom(message) {
          window.plugins.toast.showWithOptions(
            {
              message: message,
              duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
              position: "bottom",
              addPixelsY: -40  // added a negative value to move it up a bit (default 0)
            },
            function(){}, // optional
            function(){}    // optional
          );
        }

        console.log("user", User)

        $scope.requestParts = ()=>{
            if(User.request.quantity > 0){
                User.submitRequest().then((result)=>{
                    console.log("Request Submiteed", result)
                    $scope.closeRequestModal()
                    showBottom(result.data.message)
                }).catch((err)=>{
                    showBottom('Something went wrong. Please try again')
                }) 
            }else{
                showBottom('Invalid Quantity')
            }
        }

        $scope.showDashboard = (index)=>{
            console.log("showDashboard", index)
            $rootScope.drawer.init( options )
            if(index == 0){
                $scope.openProfile()
            }else if(index == 1){
                $location.url('/requests')            
            }else if(index == 2){
                $location.url('/')
                showBottom('Logged out successfully')
            }
        }

        $scope.updateProfile = ()=>{
            User.updateProfile().then(()=>{
                if(result.data.status){
                    $scope.closeProfileModal()                      
                    showBottom("Profile Updated successfully")
                }else{
                    showBottom("Something went wrong. Please check the details and try again.")
                }
            })
        }

        $scope.logout = ()=>{
            localStorage.removeItem('token')
            $location.url('/')
        }

        if(localStorage.getItem('notAvailed')){
            $scope.notAvailed = localStorage.getItem('notAvailed')=='true'?true:false            
        }else{
            $scope.notAvailed = false
            localStorage.setItem('notAvailed', $scope.notAvailed)
        }

        if(localStorage.getItem('sortOptions')){
            $scope.sortOptions = localStorage.getItem('sortOptions')
        }else{
            $scope.sortOptions = 'default'
            localStorage.setItem('sortOptions', $scope.sortOptions)
        }

        if($scope.sortOptions == 'default'){
            $scope.showDefault = true            
        }else{
            $scope.showDefault = false
        }

        $scope.openSort = ()=>{
            $('#lab-slide-bottom-popup-sort').modal().show();
        }

        $scope.closeSort = ()=>{
            $('#lab-slide-bottom-popup-sort').modal().hide();
        }

        $scope.expanded_targets = []
        _.each(User.Targets, (t)=>{
            _.each(t.data, (d)=>{
                d.discount = parseFloat(d.discount)
                d.achieved = parseFloat((d.availed_quantity / d.target_quantity * 100).toFixed(2))
                if(!$scope.notAvailed && d.availed_quantity == d.target_quantity){
                    $scope.expanded_targets.push(d)                   
                }else if(d.availed_quantity != d.target_quantity){
                    $scope.expanded_targets.push(d)                    
                }
            })
        })


        $scope.selectSort = (index)=>{
            console.log('selectSort', index)
            if(index == 0){
                $scope.sortOptions = 'default'
                $scope.showDefault = true
            }else{
                $scope.showDefault = false
                switch(index){
                    case 1: $scope.sortOptions = 'disc_lh'
                            $scope.expanded_targets = _.sortBy($scope.expanded_targets, 'discount')
                            break;
                    case 2: $scope.sortOptions = 'disc_hl'
                            $scope.expanded_targets = _.sortBy($scope.expanded_targets, 'discount').reverse()
                            break;
                    case 3: $scope.sortOptions = 'baseprice_lh'
                            $scope.expanded_targets = _.sortBy($scope.expanded_targets, 'base_price')
                            break;
                    case 4: $scope.sortOptions = 'baseprice_hl'
                            $scope.expanded_targets = _.sortBy($scope.expanded_targets, 'base_price').reverse()
                            break;

                    case 5: $scope.sortOptions = 'achieved_lh'
                            $scope.expanded_targets = _.sortBy($scope.expanded_targets, 'achieved')
                            break;

                    case 6: $scope.sortOptions = 'achieved_hl'
                            $scope.expanded_targets = _.sortBy($scope.expanded_targets, 'achieved').reverse()
                            break;
                }
            }
            localStorage.setItem('sortOptions', $scope.sortOptions)
            $scope.closeSort()
            $window.location.reload();
        }

        $scope.filter = () =>{
            console.log("filter")
            localStorage.setItem('notAvailed', $scope.notAvailed)
            $window.location.reload();
        }
    }
})()