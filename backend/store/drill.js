var sqlQuery = require('../database/sqlWrapper');
var moment = require('moment')
let _ = require("underscore");
var rethinkOps = require('../store/rethinkOps');

var getDashboardData = (code, count)=>{
	console.log(code)
	return new Promise((resolve, reject)=>{
		let current_date = moment().subtract(count, 'days').format("MMM YYYY")
		let current_month = moment().subtract(count, 'days').format("MMM YYYY")
		if(count < 10){
			let query = [
				`SELECT COUNT(*) FROM products`,
				`SELECT COUNT(*) FROM iws WHERE ddt_code LIKE '${code}%'`,
				`SELECT DISTINCT(loc_code) FROM targets WHERE ddt_code LIKE '${code}%'`,
				`SELECT SUM(target_quantity) AS target FROM targets WHERE target_date='${current_date}' AND ddt_code LIKE '${code}%'`,
				`SELECT SUM(target_quantity) AS actuals FROM uploads WHERE upload_date='${current_date}' AND ddt_code LIKE '${code}%'`,
				`SELECT u.*, p.*, t.target_quantity AS total_target FROM uploads u INNER JOIN products p INNER JOIN targets t ON u.product_id=p.id AND t.product_id=p.id AND u.upload_date=t.target_date  AND u.ddt_code=t.ddt_code AND u.iws_code=t.iws_code WHERE u.upload_date='${current_date}' AND u.ddt_code LIKE '${code}%';`,
				`SELECT iws_code AS request_iws_code, product_id AS request_product_id, target_quantity AS request_target_quantity, status FROM requests WHERE request_date LIKE '%${current_month}' AND ddt_code LIKE '${code}%'`
			]
			console.log(query)
			sqlQuery.executeQuery(query).then((result)=>{
				console.log(result)
				if(result[3][0].target && result[4][0].actuals){
					let data = {
						'total_products': result[0][0]['COUNT(*)'],
						'total_iws': result[1][0]['COUNT(*)'],
						'total_locations': result[2].length-1,
						'target': result[3][0].target,
						'actuals': result[4][0].actuals,
						'dashboard': result[5],
						'requests': result[6]
					}
					resolve({date: current_date, result: data})	
				}else{
					count++
					getDashboardData(code, count).then((res)=>{
						resolve(res)
					}).catch((err)=>{
						reject(err)
					})
				}
				
			}).catch((err)=>{
				reject(err)
			})	
		}else{
			resolve({date: current_date, result: {
				'total_products': 0,
				'total_iws': 0,
				'total_locations': 0,
				'target': 0,
				'actuals': 0,
				'dashboard': []
			}})
		}
	})
}

var getCategoryWiseData = (code, level, param1, param2, count)=>{
	return new Promise((resolve, reject)=>{
		let current_date = moment().subtract(count, 'days').format("MMM YYYY")
		if(count < 10){
			console.log(current_date)
			let query
			if(level == 0){
				query = `SELECT u.iws_category, COUNT(DISTINCT u.iws_code) AS total_iws, SUM(u.target_quantity) AS actuals, SUM(t.target_quantity) AS target FROM uploads u INNER JOIN targets t ON (u.iws_code = t.iws_code AND t.target_date = u.upload_date AND u.product_id = t.product_id) WHERE u.ddt_code LIKE '${code}%' AND u.upload_date='${current_date}' GROUP BY u.iws_category ORDER BY u.iws_category;`
			}else if(level == 1){
				query = `SELECT u.product_id, p.product_name, p.product_category, COUNT(DISTINCT u.iws_code) AS total_iws, SUM(u.target_quantity) AS actuals, SUM(t.target_quantity) AS target FROM uploads u INNER JOIN targets t INNER JOIN products p ON (u.iws_code = t.iws_code AND u.product_id = t.product_id AND t.target_date=u.upload_date AND p.id=t.product_id) WHERE u.ddt_code LIKE '${code}%' AND u.upload_date='${current_date}' AND u.iws_category='${param1}' GROUP BY u.product_id ORDER BY u.product_id; `
			}else if(level == 2){
				query = `SELECT i.name AS iws_name, u.product_id, p.product_name, p.product_category, u.iws_code, t.loc_code, u.target_quantity AS actuals, t.target_quantity AS target FROM uploads u INNER JOIN targets t INNER JOIN products p INNER JOIN iws i ON (u.iws_code = t.iws_code AND u.product_id = t.product_id AND t.target_date=u.upload_date AND t.product_id = p.id AND u.iws_code = i.iws_code) WHERE u.ddt_code LIKE '${code}%' AND u.upload_date='${current_date}' AND u.iws_category='${param1}' AND u.product_id=${param2}`
			}else{
				reject(`Invalid Drilldown Level`)
			}
			sqlQuery.executeQuery([query]).then((result)=>{
				if(result[0].length > 0){
					resolve({result: result[0], date: current_date})					
				}else{
					count++
					getCategoryWiseData(code, level, param1, param2, count).then((res)=>{
						resolve(res)
					}).catch((err)=>{
						reject(err)
					})
				}
			}).catch((err)=>{
				reject(err)
			})	
		}else{
			resolve({result: [], date: current_date})
		}
	})
}

var getLocationWiseData = (code, level, param1, param2, count)=>{
	return new Promise((resolve, reject)=>{
		let current_date = moment().subtract(count, 'days').format("MMM YYYY")
		if(count < 10){
			let query
			if(level == 0){
				query = `SELECT u.loc_code, COUNT(DISTINCT u.iws_code) AS total_iws, SUM(u.target_quantity) AS actuals, SUM(t.target_quantity) AS target FROM uploads u INNER JOIN targets t ON (u.iws_code = t.iws_code AND t.target_date = u.upload_date AND u.product_id = t.product_id) WHERE u.ddt_code LIKE '${code}%' AND u.upload_date='${current_date}' GROUP BY u.loc_code ORDER BY u.loc_code;`			
			}else if(level == 1){
				query = `SELECT u.product_id, p.product_name, p.product_category, COUNT(DISTINCT u.iws_code) AS total_iws, SUM(u.target_quantity) AS actuals, SUM(t.target_quantity) AS target FROM uploads u INNER JOIN targets t INNER JOIN products p ON (u.iws_code = t.iws_code AND u.product_id = t.product_id AND t.target_date=u.upload_date AND p.id=t.product_id) WHERE u.ddt_code LIKE '${code}%' AND u.upload_date='${current_date}' AND u.loc_code='${param1}' GROUP BY u.product_id ORDER BY u.product_id; `
			}else if(level == 2){
				query = `SELECT i.name AS iws_name, u.product_id, p.product_name, u.iws_code, t.loc_code, u.target_quantity AS actuals, t.target_quantity AS target FROM uploads u INNER JOIN targets t INNER JOIN products p INNER JOIN iws i ON (u.iws_code = t.iws_code AND u.product_id = t.product_id AND t.target_date=u.upload_date AND p.id=t.product_id) WHERE u.ddt_code LIKE '${code}%' AND u.upload_date='${current_date}' AND u.loc_code='${param1}' AND u.product_id=${param2}`
			}else{
				reject(`Invalid Drilldown Level`)
			}
			sqlQuery.executeQuery([query]).then((result)=>{
				if(result[0].length > 0){
					resolve({result: result[0], date: current_date})					
				}else{
					count++
					getLocationWiseData(code, level, param1, param2, count).then((res)=>{
						resolve(res)
					}).catch((err)=>{
						reject(err)
					})
				}
			}).catch((err)=>{
				reject(err)
			})	
		}else{
			resolve({result: [], date: current_date})
		}
	})
}

module.exports = {
	getDashboardData : getDashboardData,
	getCategoryWiseData: getCategoryWiseData,
	getLocationWiseData: getLocationWiseData
}