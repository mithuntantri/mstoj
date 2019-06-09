angular.module('mstojApp')
    .factory('tokenInterceptor', function ($q, $rootScope) {
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
    })
