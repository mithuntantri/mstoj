'use strict';

angular.module('mstojApp')
    .controller('AdminLoginCtrl', [ '$scope', '$state', 'Login', 'Toast',
        function ($scope, $state, Login, Toast) {
          localStorage.removeItem('token')
          localStorage.removeItem('admin_type')
          localStorage.removeItem('name')
          Login.loggingIn = false
          $scope.errorMessage = null
          $scope.Login = Login
          $scope.login = {
            username : '',
            password : ''
          }
          $scope.adminLogin = ()=>{
            Login.loggingIn = true
            $scope.errorMessage = null
            Login.adminLogin($scope.login).then((response)=>{
              if(response.data.status){
                localStorage.setItem('token',response.data.data.token)
                localStorage.setItem('admin_type', response.data.data.admin_type)
                localStorage.setItem('name', response.data.data.name)
                $state.go('dashboard')
              }else{
                Login.loggingIn = false
                $scope.errorMessage = response.data.message
              }
            })
          }
}]);
