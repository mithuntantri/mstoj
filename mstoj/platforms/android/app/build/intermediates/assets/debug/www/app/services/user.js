class User{
	constructor($http){
		this.$http = $http
		this.request = {
			selectedIndex1: null,
			selectedIndex2: null,
			selectedProductID: null,
			selectedProduct: null,
			quantity: 1
		}
		this.UserDetails = {}
		this.all_requests = []
	}
	getUserDetails(){
		return this.$http({
			url: `${baseUrl}/user/userDetails`,
			method: 'GET'
		})
	}

	updateProfile(){
		return this.$http({
			url: `${baseUrl}/user/userDetails`,
			method: 'PUT',
			data: this.UserDetails
		})
	}

	fetchRequests(){
    	return this.$http({
    		url: `${baseUrl}/user/requests`,
    		method: "GET"
    	})
    }

	getProductCategories(){
		return this.$http({
			url: `${baseUrl}/user/product/categories`,
			method: 'GET'
		})
	}

	getProductNames(){
		return this.$http({
			url: `${baseUrl}/user/product/names`,
			method: 'GET'
		})
	}

	getTargets(){
		return this.$http({
			url: `${baseUrl}/user/targets`,
			method: 'GET'
		})
	}
	updateDeviceInfo(onesignal){
        console.log(onesignal)
        return this.$http({
            url: `${baseUrl}/login/updateDeviceInfo`,
            method: 'POST',
            data: onesignal
        })
    }

    submitRequest(){
    	return this.$http({
    		url: `${baseUrl}/user/request`,
    		method: 'POST',
    		data: {
    			'product_id': this.request.selectedProductID,
    			'quantity' : this.request.quantity
    		}
    	})
    }

    showDashboard(index){
    	console.log("showDashboard", index)
    }
}

User.$inject = ['$http']
angular.module('app').service('User', User)