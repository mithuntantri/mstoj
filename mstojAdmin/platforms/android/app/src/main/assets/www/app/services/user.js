class User{
	constructor($http){
		this.$http = $http
		this.UserDetails = {}
		this.all_requests = []
	}
	getUserDetails(){
		return this.$http({
			url: `${baseUrl}/user/userDetails`,
			method: 'GET'
		})
	}

	getProductCategories(){
		return this.$http({
			url: `${baseUrl}/user/product/categories`,
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

    getSearchResults(search){
    	return this.$http({
            url: `${baseUrl}/admin/getSearchResults?search=${search}`,
            method: 'GET'
        })
    }

    updateRequest(id, status){
    	return this.$http({
    		url: `${baseUrl}/admin/requests`,
    		method: 'PUT',
    		data: {
    			id: id,
    			status: status
    		}
    	})
    }

    getIWSDetails(iws_code){
    	return this.$http({
    		url: `${baseUrl}/admin/iwsDetails?iws_code=${iws_code}`,
    		method: "GET"
    	})
    }
    
    fetchRequests(){
    	return this.$http({
    		url: `${baseUrl}/admin/requests`,
    		method: "GET"
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

	getAdminDashboard(code, type, level, param1, param2){
		return this.$http({
			url: `${baseUrl}/admin/distributor/data?code=${code}&type=${type}&level=${level}&param1=${param1}&param2=${param2}`,
			method: 'GET'
		})
	}
}

User.$inject = ['$http']
angular.module('app').service('User', User)