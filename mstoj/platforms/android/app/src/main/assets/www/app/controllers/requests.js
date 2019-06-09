(function() {
    'use strict';

    angular
        .module('app')
        .controller('RequestsController', RequestsController);

    RequestsController.$injector = ['$scope', '$rootScope', '$location', '$nativeDrawer', '$timeout', 'Login', 'User'];

    function RequestsController($scope, $rootScope, $location, $nativeDrawer, $timeout, Login, User){
        StatusBar.backgroundColorByHexString('#f09819');
        StatusBar.styleLightContent();
        

        $scope.showLoader = true
        $rootScope.title = 'All Requests'

        $scope.User = User
        User.fetchRequests().then((result)=>{
            $scope.showLoader = false
            if(result.data.status){
                User.all_requests = result.data.data
            }else{
                showBottom('Something went wrong')
            }
        })

        $scope.updateRequest = (index, status)=>{
            $scope.showLoader = true
            User.updateRequest(User.all_requests[index].id, status).then((result)=>{
                $scope.showLoader = false
                if(result.data.status){
                    User.all_requests = result.data.data
                    showBottom('Request '+(status=='A'?'Approved':'Rejected')+' successfully')
                }else{
                    showBottom('Something went wrong')
                }
            })
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

    }
})()