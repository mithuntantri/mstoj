class Login{
  constructor($http){
    this.$http = $http
    this.Products = []
    this.selected_product = null
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
  getAllProducts(){
    return this.$http({
      url: "/api/user/product/names",
      method: "GET"
    })
  }
}
Login.$inject = ['$http']
angular.module('mstojApp').service('Login', Login)
