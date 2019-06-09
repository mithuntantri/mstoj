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

'use strict';

angular.module('mstojApp')
    .controller('AdminDashboardCtrl',
        [ '$scope','$state', '$rootScope', 'Login', 'Toast', 'Files',
        function ($scope, $state, $rootScope, Login, Toast, Files) {
        	$scope.Files = Files
        	$scope.name = localStorage.getItem('name')
        	$scope.admin_type = localStorage.getItem('admin_type')
        	Login.loggingOut = false
        	$scope.upload_options = [
        		{
        			'name': 'Upload IWS List',
        			'selected': $scope.admin_type == 'SU'?true:false,
        			'restricted' : true,
        		},
        		{
        			'name': 'Upload Product List',
        			'selected': false,
        			'restricted': true,
        		},
        		{
        			'name': 'Upload Target List',
        			'selected': false,
        			'restricted': true
        		},
        		{
        			'name': 'Upload Daily Data',
        			'selected': $scope.admin_type == 'DI'?true:false,
        			'restricted': false
        		}
        	]
        	$scope.selected_option = $scope.upload_options[0].name
        	$scope.selectOption = (index)=>{
        		_.each($scope.upload_options, (upload_option, i)=>{
        			upload_option.selected = false
        			if(i == index){
        				upload_option.selected = true
        			}
        		})
        		$scope.selected_option = $scope.upload_options[index].name
        	}
        	$scope.adminLogout = ()=>{
        		Login.loggingOut = true
        		localStorage.removeItem('token')
        		localStorage.removeItem('name')
        		localStorage.removeItem('admin_type')
        		$state.go('login')
        	}

        	//DOM
const $ = document.querySelector.bind(document);

//APP
let App = {};
App.init = (function() {
	//Init
	function handleFileSelect(evt) {
		const files = evt.target.files; // FileList object
		Files.uploadFile(evt.target, $scope.selected_option)
		//files template
		let template = `${Object.keys(files)
			.map(file => `<div class="file file--${file}">
     <div class="name"><span>${files[file].name}</span></div>
     <div class="progress active"></div>
     <div class="done">
	<a href="" target="_blank">
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 1000 1000">
		<g><path id="path" d="M500,10C229.4,10,10,229.4,10,500c0,270.6,219.4,490,490,490c270.6,0,490-219.4,490-490C990,229.4,770.6,10,500,10z M500,967.7C241.7,967.7,32.3,758.3,32.3,500C32.3,241.7,241.7,32.3,500,32.3c258.3,0,467.7,209.4,467.7,467.7C967.7,758.3,758.3,967.7,500,967.7z M748.4,325L448,623.1L301.6,477.9c-4.4-4.3-11.4-4.3-15.8,0c-4.4,4.3-4.4,11.3,0,15.6l151.2,150c0.5,1.3,1.4,2.6,2.5,3.7c4.4,4.3,11.4,4.3,15.8,0l308.9-306.5c4.4-4.3,4.4-11.3,0-15.6C759.8,320.7,752.7,320.7,748.4,325z"</g>
		</svg>
						</a>
     </div>
    </div>`)
			.join("")}`;

		$("#drop").classList.add("hidden");
		$("footer").classList.add("hasFiles");
		// $(".importar").classList.add("active");
		setTimeout(() => {
			$(".list-files").innerHTML = template;
		}, 1000);

		Object.keys(files).forEach(file => {
			let load = 2000 + (file * 2000); // fake load
			setTimeout(() => {
				$(`.file--${file}`).querySelector(".progress").classList.remove("active");
				$(`.file--${file}`).querySelector(".done").classList.add("anim");
			}, load);
		});
	}

	// trigger input
	$("#triggerFile").addEventListener("click", evt => {
		evt.preventDefault();
		$("input[type=file]").click();
	});

	// drop events
	$("#drop").ondragleave = evt => {
		$("#drop").classList.remove("active");
		evt.preventDefault();
	};
	$("#drop").ondragover = $("#drop").ondragenter = evt => {
		$("#drop").classList.add("active");
		evt.preventDefault();
	};
	$("#drop").ondrop = evt => {
		$("input[type=file]").files = evt.dataTransfer.files;
		$("footer").classList.add("hasFiles");
		$("#drop").classList.remove("active");
		evt.preventDefault();
	};

	//upload more
	// $(".importar").addEventListener("click", () => {
	// 	$(".list-files").innerHTML = "";
	// 	$("footer").classList.remove("hasFiles");
	// 	$(".importar").classList.remove("active");
	// 	setTimeout(() => {
	// 		$("#drop").classList.remove("hidden");
	// 	}, 500);
	// });

	// input change
	$("input[type=file]").addEventListener("change", handleFileSelect);
})();

}]);

angular.module('mstojApp')
    .factory('tokenInterceptor', ["$q", "$rootScope", function ($q, $rootScope) {
            return {
                request: function(config) {
                    config.headers = config.headers || {};
                    let token = localStorage.getItem('token')
                    if (token) {
                        config.headers.Authorization = token
                    }
                    return config || $q.when(config);
                },
                responseError: function(response) {
                    if (response.status === 401) {
                        $rootScope.$broadcast('tokenexpired')
                    }else if(response.status == 502 || response.status == 500){
                      $rootScope.$broadcast('reloadpage')
                    }
                    return response || $q.when(response);
                }
            };
    }])

class Toast{
  constructor($mdToast){
    this.$mdToast = $mdToast
  }
  showSuccess(msg){
    this.$mdToast.show(
        this.$mdToast.simple().textContent(msg).hideDelay(3000).position('top center').theme('success-toast')
    )
  }
  showError(msg){
    this.$mdToast.show(
        this.$mdToast.simple().textContent(msg).hideDelay(3000).position('top center').theme('error-toast')
    )
  }
}
Toast.$inject = ['$mdToast']
angular.module('mstojApp').service('Toast', Toast)

class Login{
  constructor($http){
    this.$http = $http
  }
  adminLogin(data){
    return this.$http({
      url: "/api/admin/login",
      method: "POST",
      data : data
    })
  }
  adminLogout(){
    return this.$http({
      url: "/api/admin/logout",
      method: "POST"
    })
  }
}
Login.$inject = ['$http']
angular.module('mstojApp').service('Login', Login)

class Files{
  constructor($http, $timeout, Toast){
    this.$http = $http
    this.$timeout = $timeout
    this.Toast = Toast
    this.validFormats = ['xls', 'xlsx', 'csv'];
    this.file_name = null
    this.FileMessage = null
    this.show_loader = false
  }

  uploadFile(element, option){
      this.$timeout(()=>{
        this.enableUpload = false
        this.theFile = element.files[0];
        this.FileMessage = null;
        var filename = this.theFile.name;
        var ext = filename.split(".").pop()
        var is_valid = this.validFormats.indexOf(ext) !== -1;
        var is_one = element.files.length == 1
        var is_valid_filename = this.theFile.name.length <= 64
        if (is_valid && is_one && is_valid_filename){
          this.show_loader = true
          var data = new FormData();
          data.append('file', this.theFile);
          let url = `/api/admin/upload?option=${option}`
          this.$http({
            url: url,
            method: 'POST',
            headers: {'Content-Type': undefined},
            data: data
          }).then((response)=>{
            if(response.data.status){
              this.enableUpload = false
              this.Toast.showSuccess(response.data.message)
              this.resetUpload()
            }else{
              this.Toast.showError(response.data.message)
              this.resetUpload()
            }
            this.show_loader = false
          }).catch(()=>{
            this.Toast.showError(`Something went wrong while uploading`)
            this.show_loader = false
            this.resetUpload()
          })
          angular.element("input[type='file']").val(null);
        } else if(!is_valid){
          this.theFile = ''
          angular.element("input[type='file']").val(null);
          this.FileMessage = 'Please upload correct File Name, File extension is not supported';
        } else if(!is_one){
          this.theFile = ''
          angular.element("input[type='file']").val(null);
          this.FileMessage = 'Cannot upload more than one file at a time';
        } else if(!is_valid_filename){
          this.theFile = ''
          angular.element("input[type='file']").val(null);
          this.FileMessage = 'Filename cannot exceed 64 Characters';
        }
      })
  }
  resetUpload(){
    setTimeout(() => {
      $("#drop").removeClass("hidden");
      $("footer").removeClass("hasFiles");
      $("footer").classList.add("hidden");
      $(".list-files").innerHTML = ``;
    }, 1000);
  }
}
Files.$inject = ['$http', '$timeout', 'Toast']
angular.module('mstojApp').service('Files', Files)

