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
