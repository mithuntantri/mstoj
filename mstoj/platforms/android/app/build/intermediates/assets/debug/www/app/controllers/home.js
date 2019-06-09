(function() {
    'use strict';

    angular
        .module('app')
        .controller('HomeController', HomeController);

    HomeController.$injector = ['$scope', '$location', '$timeout', 'Login'];

    function HomeController($scope, $location, $timeout, Login){

    	$scope.isLoggedIn = false
    	$scope.showOTP = false
        $scope.login = {
            'username': '',
            'password': ''
        }
    	$scope.register = {
            'username': '',
            'mobile_number': '',
            'password': '',
            'confirm_password': ''
        }
    	$scope.otp = ['','','','','','']
    	$scope.token = localStorage.getItem('token')
        $scope.current_modal = ''
        $scope.showBtnLoader = false
        $scope.showTokenLoader = true

    	if($scope.token){
    		Login.validateToken($scope.token).then((result)=>{
    			if(result.data.status){
    				$scope.isLoggedIn = true
    				$location.url('/dashboard')
    			}else{
                    localStorage.removeItem('token', token)
                    showBottom(result.data.message)
                    $scope.showTokenLoader = false
                }
    		})
    	}else{
            $scope.showTokenLoader = false
        }

    	$scope.loginUser = ()=>{
            $scope.showBtnLoader = true
    		Login.userLogin($scope.login).then((result)=>{
                $scope.showBtnLoader = false
    			if(result.data.status){
    				$scope.showOTP = true
                    $scope.openOTPScreen()
    			}else{
    				$scope.error = result.data.message
                    showBottom(result.data.message)
    			}
    		})
    	}

        $scope.registerUser = ()=>{
            $scope.showBtnLoader = true
            console.log($scope.register)
            Login.userRegister($scope.register).then((result)=>{
                $scope.showBtnLoader = false
                if(result.data.status){
                    $scope.showOTP = true
                    $scope.openOTPScreen()
                }else{
                    $scope.error = result.data.message
                }
            })
        }

        $scope.verifyUser = ()=>{
            $scope.showBtnLoader = true
            if($scope.current_modal == 'register'){
                Login.verifyUser($scope.register.username, $scope.otp.join("")).then((result)=>{
                    $scope.showBtnLoader = false
                    if(result.data.status){
                        showBottom(result.data.data.message)
                        $scope.openSetPassword()
                    }else{
                        $scope.otp = ''
                        $scope.closeAllModals()
                        showBottom(result.data.message)
                    }
                })                
            }else if($scope.current_modal == 'login'){
                Login.verifyLogin($scope.login.username, $scope.otp.join("")).then((result)=>{
                    $scope.showBtnLoader = false
                    if(result.data.status){
                        localStorage.setItem('token', result.data.data.token)
                        $location.url("/dashboard")
                        showBottom(result.data.data.message)
                    }else{
                        $scope.otp = ''
                        $scope.closeAllModals()
                        showBottom(result.data.message)
                    }
                })
            }
        }

        $scope.setPassword = ()=>{
            $scope.showBtnLoader = true
            Login.setPassword($scope.register).then((result)=>{
                $scope.showBtnLoader = false
                if(result.data.status){
                    localStorage.setItem('token', result.data.data.token)
                    showBottom(result.data.data.message)
                    $location.url('/dashboard')
                }else{
                    $scope.otp = ''
                    $scope.closeAllModals()
                    showBottom(result.data.message)
                }
            })                
        }

        $scope.closeAllModals = ()=>{
            console.log("Closing All modals")
            StatusBar.backgroundColorByHexString('#fff');
            StatusBar.styleDefault();
            $('#lab-slide-bottom-popup-otp').modal().hide();
        }

		$scope.openSignUp = ()=>{
            $scope.current_modal = 'register'
            StatusBar.backgroundColorByHexString('#f09819');
            StatusBar.styleLightContent();
            $('#lab-slide-bottom-popup-login').modal('hide');
			$('#lab-slide-bottom-popup-register').modal('show');
		    $('.lab-slide-up').find('a').attr('data-toggle', 'modal');
		    $('.lab-slide-up').find('a').attr('data-target', '#lab-slide-bottom-popup-register');
		}

        $scope.openSignIn = ()=>{
            $scope.current_modal = 'login'
            StatusBar.backgroundColorByHexString('#f09819');
            StatusBar.styleLightContent();
            $('#lab-slide-bottom-popup-register').modal('hide');
            $('#lab-slide-bottom-popup-login').modal('show');
            $('.lab-slide-up').find('a').attr('data-toggle', 'modal');
            $('.lab-slide-up').find('a').attr('data-target', '#lab-slide-bottom-popup-login');
        }

        $scope.openOTPScreen = ()=>{
            $scope.startOTPRead()
            StatusBar.backgroundColorByHexString('#f09819');
            StatusBar.styleLightContent();
            $('#lab-slide-bottom-popup-register').modal('hide');
            $('#lab-slide-bottom-popup-login').modal('hide');
            $('#lab-slide-bottom-popup-otp').modal('show');
            $('.lab-slide-up').find('a').attr('data-toggle', 'modal');
            $('.lab-slide-up').find('a').attr('data-target', '#lab-slide-bottom-popup-otp');
        }

        $scope.openSetPassword = ()=>{
            StatusBar.backgroundColorByHexString('#f09819');
            StatusBar.styleLightContent();
            $('#lab-slide-bottom-popup-otp').modal('hide');
            $('#lab-slide-bottom-popup-setpass').modal('show');
            $('.lab-slide-up').find('a').attr('data-toggle', 'modal');
            $('.lab-slide-up').find('a').attr('data-target', '#lab-slide-bottom-popup-setpass');
        }

        $scope.otpInput = {
            size:6,
            type:"number",
            value: "",
            onDone: function(value){
                console.log(value);
            },
            onChange: function(value){
                console.log(value);
                if(value.length == 6){
                    $scope.verifyUser()
                }
            }
        }

        $scope.startOTPRead = ()=>{
            console.log("Reading OTP")
            var options = {
                delimiter : "Welcome from CAPQUO! Your one time password (OTP) for registration is",
                length : 6,
                origin : "CAPQUO"
              };
              
              var success = function (otp) {
                console.log("GOT OTP", otp);
                $timeout(()=>{
                    $scope.otp = otp.split("") 
                    $scope.otpInput.value = otp
                    _.times(6, (i)=>{
                        $('#otpInput'+i).val(otp.split("")[i])
                    }) 
                    $scope.verifyUser()                 
                })
                OTPAutoVerification.stopOTPListener();
              }

              var failure = function () {
                OTPAutoVerification.stopOTPListener();
                console.log("Problem in listening OTP");
              }

              OTPAutoVerification.startOTPListener(options, success, failure);
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

        $(".otp-input").keyup(function () {
          if (this.value.length == this.maxLength) {
            $(this).next('.otp-input').focus();
          }
        });
    }
})();