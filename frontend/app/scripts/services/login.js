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
