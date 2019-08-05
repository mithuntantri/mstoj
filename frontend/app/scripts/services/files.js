class Files{
  constructor($http, $timeout, Toast, Login){
    this.$http = $http
    this.Login = Login
    this.$timeout = $timeout
    this.Toast = Toast
    this.validFormats = ['xls', 'xlsx', 'csv']
    this.validFormats2 = ['jpg']
    this.file_name = null
    this.FileMessage = null
    this.show_loader = false
  }

  uploadFile(element, option){
      this.$timeout(()=>{
        this.enableUpload = false
        this.theFile = element.files[0];
        this.FileMessage = null;
        console.log("option", option)
        // if(option == 'Upload Product Image'){
        //     console.log(this.Login.selected_product)
        //     let name = this.Login.Products[this.Login.selected_product].product_category
        //     console.log(name)
        //     this.theFile.name = name.replace(/ /g, '_')
        // }
        var filename = this.theFile.name;
        var ext = filename.split(".").pop()
        var is_valid, is_one, is_valid_filename
        if(option == 'Upload Product Image'){
          is_valid = this.validFormats2.indexOf(ext) !== -1;
        }else{
          is_valid = this.validFormats.indexOf(ext) !== -1;
        }
        is_one = element.files.length == 1
        is_valid_filename = this.theFile.name.length <= 64
        console.log(is_valid, is_one, is_valid_filename)
        if (is_valid && is_one && is_valid_filename){
          this.show_loader = true
          var data = new FormData();
          data.append('file', this.theFile);
          let url = `/api/admin/upload?option=${option}`
          if(option == 'Upload Product Image'){
            let id = this.Login.Products[this.Login.selected_product].id
            let name = this.Login.Products[this.Login.selected_product].product_category
            url += `&id=${id}&name=${name}`
          }
          console.log("url", url)
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
Files.$inject = ['$http', '$timeout', 'Toast', 'Login']
angular.module('mstojApp').service('Files', Files)
