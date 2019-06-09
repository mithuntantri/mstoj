var hash = require('bcryptjs');
var otplib = require('otplib').default;
var jwt = require('jwt-simple');
var sqlQuery = require('../database/sqlWrapper');
var moment = require('moment')
let _ = require("underscore");
var rethinkOps = require('../store/rethinkOps');
var otplib = require('otplib').default;
var request = require('request');
var notifications = require('../store/notifications')

var UserDetails = (username)=>{
	return new Promise((resolve, reject)=>{
		let query = `SELECT id, iws_code, name, email, primary_mobile, secondary_mobile FROM iws where iws_code='${username}'`
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve(result[0][0])
		}).catch((err)=>{
			reject(err)
		})
	})
}

var ProductCategories = ()=>{
	return new Promise((resolve, reject)=>{
		let query = `select distinct(product_name) from products`
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve(result[0])
		}).catch((err)=>{
			reject(err)
		})
	})
}

var AllProducts = ()=>{
	return new Promise((resolve, reject)=>{
		let query = `SELECT * FROM products`
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve(result[0])
		}).catch((err)=>{
			reject(err)
		})
	})
}

var GetAllTargets = (username, current_date)=>{
	return new Promise((resolve, reject)=>{
		let query = `SELECT * FROM products p INNER JOIN targets t ON p.id=t.product_id WHERE iws_code='${username}' AND target_date='${current_date}'`
		console.log(query)
		sqlQuery.executeQuery([query]).then((result)=>{
			_.each(result[0], (res)=>{
				res.availed_quantity = 0
			})
			let res = groupBy(result[0], 'product_name')
			resolve(res)
		}).catch((err)=>{
			reject(err)
		})
	})
}

function groupBy(arr, key) {
        var newArr = [],
            types = {},
            newItem, i, j, cur;
        for (i = 0, j = arr.length; i < j; i++) {
            cur = arr[i];
            if (!(cur[key] in types)) {
                types[cur[key]] = { type: cur[key], data: [] };
                newArr.push(types[cur[key]]);
            }
            types[cur[key]].data.push(cur);
        }
        return newArr;
}

var submitRequest = (user, request)=>{
	console.log("submitRequest", user.username, request)
	return new Promise((resolve, reject)=>{
		let current_date = moment().format("MMM YYYY")
		let timestamp = moment().unix()
		let query = `SELECT * FROM iws WHERE iws_code='${user.username}'`
		sqlQuery.executeQuery([query]).then((result)=>{
			if(result[0].length > 0){
				let ddt_code = result[0][0].ddt_code
				query = `INSERT INTO requests (id, iws_code, ddt_code, request_date, product_id, target_quantity, status, timestamp) VALUES(null, '${user.username}', '${ddt_code}', '${current_date}', ${request.product_id}, ${request.quantity}, 'P', ${timestamp});`
				sqlQuery.executeQuery([query]).then(()=>{
					console.log("Insert complete")
					let message = {
						message: `${user.username} has requested for ${request.quantity} extra parts.`,
						title: `New Part Request from ${user.username}`
					}
					notifications.sendSpecificDeviceNotification(user.username, 'user', ddt_code, message)
					resolve()
				}).catch((err)=>{
					console.log(err)
					reject(err)
				})
			}else{
				console.log("No Result", result)
				reject("No Result")
			}
		}).catch((err)=>{
			console.log(err)
			reject(err)
		})
	})
}

var getAllRequests = (username)=>{
	return new Promise((resolve, reject)=>{
		console.log("getAllRequests", username)
		let query = `SELECT r.*, p.product_name, p.product_category FROM requests r INNER JOIN products p ON r.product_id=p.id WHERE iws_code='${username}' ORDER BY r.timestamp DESC`
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve(result[0])
		}).catch((err)=>{
			reject(err)
		})
	})
}

var getAdminRequests = (username)=>{
	return new Promise((resolve, reject)=>{
		console.log("getAdminRequests", username)
		username = username.split("MSDI")[1]
		let query = `SELECT r.*, p.product_name, p.product_category FROM requests r INNER JOIN products p ON r.product_id=p.id WHERE ddt_code='${username}' ORDER BY r.timestamp DESC`
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve(result[0])
		}).catch((err)=>{
			reject(err)
		})
	})
}

var updateRequests = (username, request)=>{
	return new Promise((resolve, reject)=>{
		let query1 = `UPDATE requests SET status='${request.status}' WHERE id=${request.id}`
		let query2 = `SELECT * FROM requests WHERE id=${request.id}`
		console.log(query1, query2)
		sqlQuery.executeQuery([query1, query2]).then((result)=>{
			console.log(result[1])
			let message = {
				message: `Distributor has ${request.status=='A'?'approved':'rejected'} your request for ${result[1][0].target_quantity} parts`,
				title: `Your part request has been ${request.status=='A'?'approved':'rejected'}`
			}
			notifications.sendSpecificDeviceNotification(username, 'admin', result[1][0].iws_code, message)
			getAdminRequests(username).then((result)=>{
				resolve(result)
			}).catch((err)=>{
				console.log(err)
				reject(err)
			})
		}).catch((err)=>{
			console.log(err)
			reject(err)
		})
	})
}

var updateUserDetails = (username, user)=>{
	return new Promise((resolve, reject)=>{
		let query = `UPDATE iws SET email='${user.email}, primary_mobile='${user.primary_mobile}, secondary_mobile='${user.secondary_mobile}' WHERE username='${username}'`
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			reject()
		})
	})
}

var getSearchResults = (search, username)=>{
	username = username.split("MSDI")[1]
	return new Promise((resolve, reject)=>{
		let query = `SELECT iws_code, name, email, primary_mobile, secondary_mobile FROM iws WHERE ddt_code='${username}' AND (iws_code LIKE '%${search}%' OR  name LIKE '%${search}%' OR  email LIKE '%${search}%' OR  primary_mobile LIKE '%${search}%' OR secondary_mobile LIKE '%${search}%') LIMIT 10`
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve(result[0])
		}).catch((err)=>{
			reject()
		})
	})
}

var getIWSDetails = (iws_code, username)=>{
	return new Promise((resolve, reject)=>{
		let current_date = moment().format("MMM YYYY")
		let query = `SELECT p.product_name, p.product_category, t.loc_code, t.target_quantity, t.target_date, t.product_id, u.target_quantity AS total_quantity FROM targets t INNER JOIN uploads u INNER JOIN products p ON u.product_id=t.product_id WHERE t.iws_code=u.iws_code AND t.target_date=u.upload_date AND t.product_id=p.id AND u.product_id=p.id AND t.target_date LIKE '%${current_date}' AND t.iws_code='${iws_code}'`
				console.log(query)
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve(result[0])
		}).catch((err)=>{
			reject(err)
		})
	})
}

module.exports = {
	UserDetails: UserDetails,
	ProductCategories: ProductCategories,
	AllProducts : AllProducts,
	GetAllTargets: GetAllTargets,
	submitRequest: submitRequest,
	getAdminRequests: getAdminRequests,
	getAllRequests: getAllRequests,
	updateRequests: updateRequests,
	updateUserDetails: updateUserDetails,
	getSearchResults: getSearchResults,
	getIWSDetails: getIWSDetails
}