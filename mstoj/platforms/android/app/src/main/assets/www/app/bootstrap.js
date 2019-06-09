// (function() {
    'use strict';

    var origin = 'http://3.92.196.92'
    var baseUrl = origin + '/api'
    var addedObservers = false
    
    angular.module('app',['ngRoute', 'otpInputDirective'])
    .config(function($routeProvider, $httpProvider)
    {
        $routeProvider
        .when('/', {
            templateUrl  : 'app/views/home.html',
            controller   : 'HomeController',
            controllerAs : 'Home'
        })
        .when('/requests', {
            templateUrl: 'app/views/request.html',
            controller: 'RequestsController',
            controllerAs: 'Requests'
        })
        .when("/dashboard", {
            templateUrl  : 'app/views/dashboard.html',
            controller   : 'DashboardController',
            controllerAs : 'Dashboard',
            resolve: {
                getUserDetails: ['$q', 'User', function($q, User){
                    let deferred = $q.defer()
                    User.getUserDetails().then((result)=>{
                        if(result.data.status){
                            User.UserDetails = result.data.data
                            deferred.resolve()
                        }else{
                            deferred.reject()
                        }
                    }).catch(()=>{
                        deferred.reject()
                    })
                    return deferred.promise
                }],
                updateDeviceInfo: ['$q', 'User', function($q, User){
                    console.log("updateDeviceInfo")
                    let deferred = $q.defer()
                    let userId = localStorage.getItem('OS_userId')
                    let pushToken = localStorage.getItem('OS_pushToken')
                    console.log(userId, pushToken)
                    if(userId && pushToken){
                        User.updateDeviceInfo({userId: userId, pushToken: pushToken}).then((result)=>{
                            if(result.data.status){
                                deferred.resolve()
                            }else{
                                deferred.reject()
                            }
                        }).catch(()=>{
                            deferred.reject()
                        })
                    }else{
                        deferred.resolve()
                    }
                    return deferred.promise
                }],
                getProductCategories: ['$q', 'User', function($q, User){
                    let deferred = $q.defer()
                    User.getProductCategories().then((result)=>{
                        if(result.data.status){
                            User.ProductCategories = result.data.data
                            deferred.resolve()
                        }else{
                            deferred.reject()
                        }
                    }).catch(()=>{
                        deferred.reject()
                    })
                    return deferred.promise
                }],
                getProductNames: ['$q', 'User', function($q, User){
                    let deferred = $q.defer()
                    User.getProductNames().then((result)=>{
                        if(result.data.status){
                            User.ProductNames = result.data.data
                            deferred.resolve()
                        }else{
                            deferred.reject()
                        }
                    }).catch(()=>{
                        deferred.reject()
                    })
                    return deferred.promise
                }],
                getTargets: ['$q', 'User', function($q, User){
                    let deferred = $q.defer()
                    User.getTargets().then((result)=>{
                        if(result.data.status){
                            User.Targets = result.data.data
                            _.each(User.Targets, (category)=>{
                                category.completed_tickets = 0
                                category.total_tickets = 0
                                _.each(category.data, (part)=>{
                                    part.completed = Math.ceil(part.availed_quantity / part.target_quantity * 100)
                                    part.remaining = 100 - part.completed
                                    part.completed = part.completed + '%'
                                    part.remaining = part.remaining + '%'
                                    category.completed_tickets += part.availed_quantity
                                    category.total_tickets += part.target_quantity
                                })
                                category.completed = Math.ceil(category.completed_tickets / category.total_tickets * 100)
                                category.remaining = 100 - category.completed
                            })
                            deferred.resolve()
                        }else{
                            deferred.reject()
                        }
                    }).catch(()=>{
                        deferred.reject()
                    })
                    return deferred.promise
                }]
            }
        })
        .otherwise ({ redirectTo: '/' });

        $httpProvider.interceptors.push('tokenInterceptor');
    })
    .run(function($rootScope, $nativeDrawer){
        document.addEventListener("deviceready", function () {
            StatusBar.backgroundColorByHexString('#fff');
            StatusBar.styleDefault();
            console.info("Cordova initialized with success");
             var iosSettings = {};
        iosSettings["kOSSettingsKeyAutoPrompt"] = false;
        iosSettings["kOSSettingsKeyInAppLaunchURL"] = true;

        window.plugins.OneSignal
          .startInit("39eaafab-b693-4bfb-93da-89fb2ea64a33")
          .handleNotificationReceived(function(jsonData) {
            alert("Notification received: \n" + JSON.stringify(jsonData));
            console.log('Did I receive a notification: ' + JSON.stringify(jsonData));
          })
          .handleNotificationOpened(function(jsonData) {
            alert("Notification opened: \n" + JSON.stringify(jsonData));
            console.log('didOpenRemoteNotificationCallBack: ' + JSON.stringify(jsonData));
          })
          .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.InAppAlert)
          .iOSSettings(iosSettings)
          .endInit();

        if (addedObservers == false) {
            registerForPushNotification()
            addedObservers = true;

            window.plugins.OneSignal.getPermissionSubscriptionState(function(permission){
                if(permission.subscriptionStatus.subscribed == false){
                    registerForPushNotification()
                }
            })

            window.plugins.OneSignal.addEmailSubscriptionObserver(function(stateChanges) {
                console.log("Email subscription state changed: \n" + JSON.stringify(stateChanges, null, 2));
            });

            window.plugins.OneSignal.addSubscriptionObserver(function(stateChanges) {
                console.log("Push subscription state changed: " + JSON.stringify(stateChanges, null, 2));

                window.plugins.OneSignal.getIds(function(onesignal){
                    console.log(onesignal)
                    localStorage.setItem('OS_userId', onesignal.userId)
                    localStorage.setItem('OS_pushToken', onesignal.pushToken)
                    User.updateDeviceInfo(onesignal)
                })
            });

            window.plugins.OneSignal.addPermissionObserver(function(stateChanges) {
                console.log("Push permission state changed: " + JSON.stringify(stateChanges, null, 2));
            });
        }

function registerForPushNotification() {
    console.log("Register button pressed");
    window.plugins.OneSignal.registerForPushNotifications();
    // Only works if user previously subscribed and you used setSubscription(false) below
    window.plugins.OneSignal.setSubscription(true);
}

function getIds() {
    window.plugins.OneSignal.getIds(function(ids) {
        document.getElementById("OneSignalUserId").innerHTML = "UserId: " + ids.userId;
        document.getElementById("OneSignalPushToken").innerHTML = "PushToken: " + ids.pushToken;
        console.log('getIds: ' + JSON.stringify(ids));
        alert("userId = " + ids.userId + "\npushToken = " + ids.pushToken);
    });
}

function sendTags() {
    window.plugins.OneSignal.sendTags({PhoneGapKey: "PhoneGapValue", key2: "value2"});
    alert("Tags Sent");
}

function getTags() {
    window.plugins.OneSignal.getTags(function(tags) {
        alert('Tags Received: ' + JSON.stringify(tags));
    });
}

function deleteTags() {
    window.plugins.OneSignal.deleteTags(["PhoneGapKey", "key2"]);
    alert("Tags deleted");
}

function promptLocation() {
    window.plugins.OneSignal.promptLocation();
    // iOS - add CoreLocation.framework and add to plist: NSLocationUsageDescription and NSLocationWhenInUseUsageDescription
    // android - add one of the following Android Permissions:
    // <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
    // <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
}

function syncHashedEmail() {
    window.plugins.OneSignal.syncHashedEmail("example@google.com");
    alert("Email synced");
}

function postNotification() {
    window.plugins.OneSignal.getIds(function(ids) {
        var notificationObj = { contents: {en: "message body"},
                          include_player_ids: [ids.userId]};
        window.plugins.OneSignal.postNotification(notificationObj,
            function(successResponse) {
                console.log("Notification Post Success:", successResponse);
            },
            function (failedResponse) {
                console.log("Notification Post Failed: ", failedResponse);
                alert("Notification Post Failed:\n" + JSON.stringify(failedResponse, null, 2));
            }
        );
    });
}

function setSubscription() {
    window.plugins.OneSignal.setSubscription(false);
}

function setEmail() {
    console.log("Setting email: " + document.getElementById("email").value);
    window.plugins.OneSignal.setEmail(document.getElementById("email").value, function() {
        console.log("Successfully set email");
    }, function(error) {
        alert("Encountered an error setting email: \n" + JSON.stringify(error, null, 2));
    });
}

function logoutEmail() {
    console.log("Logging out of email");
    window.plugins.OneSignal.logoutEmail(function(successResponse) {
        console.log("Successfully logged out of email");
    }, function(error) {
        alert("Failed to log out of email with error: \n" + JSON.stringify(error, null, 2));
    });
}
        }, false);
    })
    .filter('getProductImage', ()=>{
        return (product)=>{
            if(product == 'Brake Pad'){
                return 'brake-pad.jpg'
            }else if(product == 'Brake Fluid'){
                return 'brake-fluid.jpg'
            }else if(product == 'Brake Shoe'){
                return 'brake-shoe.png'
            }else if(product == 'Headlamp'){
                return 'headlamp.png'
            }else{
                return 'brake-pad.jpg'
            }
        }
    })

// })();