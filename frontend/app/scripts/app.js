'use strict';

angular.module('mstojApp', [
    'ngMaterial',
    'ui.router'
  ])
  .config(['$stateProvider', '$urlRouterProvider', '$mdThemingProvider', '$httpProvider', '$locationProvider',
  function ($stateProvider, $urlRouterProvider, $mdThemingProvider, $httpProvider, $locationProvider) {

    $mdThemingProvider.theme('success-toast');
    $mdThemingProvider.theme('error-toast');
    $httpProvider.interceptors.push('tokenInterceptor');

    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise("/dashboard");
    $urlRouterProvider.when("/", "/dashboard")
    $urlRouterProvider.when("/login", "/dashboard")

    $stateProvider
      .state('login', {
        url : '/login',
        controller: 'AdminLoginCtrl',
        templateUrl : 'views/admin/login.html'
      })
      .state('dashboard', {
        url : '/dashboard',
        controller: 'AdminDashboardCtrl',
        templateUrl : 'views/admin/dashboard.html',
        resolve: {
          checkToken : ['$q', function($q){
            let deferred = $q.defer()
            if(localStorage.getItem('token')){
              deferred.resolve()
            }else{
              deferred.reject('tokenexpired')
            }
            return deferred.promise
          }],
          getAllProducts : ['$q', 'Login', function($q, Login){
            let deferred = $q.defer()
            Login.getAllProducts().then((result)=>{
              if(result.data.status && result.data.data.length > 0){
                Login.Products = result.data.data
                Login.selected_product = 0
              }else{
                Login.Products = []
                Login.selected_product = null
              }
            })
            deferred.resolve()
            return deferred.promise
          }]
        }
      })
  }])

  .run(['$location','$rootScope','$state','$window',
    function ($location, $rootScope, $state, $window) {
      $rootScope.$on('tokenexpired', function () {
        $state.go('login');
      })
      $rootScope.$on('$stateChangeError', (event, toState, toParams, fromState, fromParams, error)=>{
        $state.go("login")
      })
  }])
