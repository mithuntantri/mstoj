var hash = require('bcryptjs');
var otplib = require('otplib').default;
var jwt = require('jwt-simple');
var sqlQuery = require('../database/sqlWrapper');
var moment = require('moment')
let _ = require("underscore");
var rethinkOps = require('../store/rethinkOps');

var createDatabase = ()=>{
	return new Promise((resolve, reject)=>{
		console.log("[*] Creating neccessary database (if not exists)")
		let database_name = process.env.TS_MYSQL_DBNAME
		let query = `CREATE DATABASE IF NOT EXISTS ${database_name}`
		sqlQuery.executeQuery([query]).then((result)=>{
			createTables().then(()=>{
				resolve()				
			}).catch((err)=>{
				reject(err)
			})
		}).catch((err)=>{
			reject(err)
		})
	})
}

var admins = [
	{
		"ddt_code": "MS01",
		"name": "Maruti Suzuki",
		"email": "",
		"primary_mobile": "",
		"secondary_mobile": "",
		"username": "MS01",
		"admin_type": "SU",
		"password": "MS01@123"
	}
]

var insertAdminValues = (admins)=>{
	return new Promise((resolve, reject)=>{
		console.log("[*] Preparing Credentials for Admin")
		let queries = []
		_.each(admins, (admin)=>{
			if(!admin.admin_type){
				admin.admin_type = 'DI'
			}
			if(!admin.username){
				admin.username = 'MS' + admin.admin_type + admin.ddt_code
			}
			if(!admin.password){
				admin.password = admin.ddt_code + '@123'
			}
			console.log(">>>admin",admin)
			hash.genSalt(15, function (error, salt) {
        		hash.hash(admin.password, salt, function (err, hashed_password) {
					queries.push(`INSERT INTO admin (ddt_code, name, username, password, admin_type) VALUES('${admin.ddt_code}', '${admin.name}','${admin.username}', '${hashed_password}', '${admin.admin_type}')`)
					if(queries.length == admins.length){
						sqlQuery.executeQuery(queries).then((result)=>{
							resolve()			
						}).catch((err)=>{
							reject(err)
						})
					}
				})
        	})
		})
	})
}

var createAdminTable = ()=>{
	return new Promise((resolve, reject)=>{
		let query = `CREATE TABLE IF NOT EXISTS admin (
						id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
						ddt_code VARCHAR(4) NOT NULL,
						name VARCHAR(64) NOT NULL,
						email VARCHAR(64) NULL,
						primary_mobile VARCHAR(10) NULL,
						secondary_mobile VARCHAR(10) NULL,
						username VARCHAR(32) NOT NULL, 
						password VARCHAR(255) NOT NULL, 
						admin_type VARCHAR(2) NOT NULL,
						first_time_login boolean NOT NULL DEFAULT true,
						last_login_time VARCHAR(32), 
						failed_login_attempts INT NOT NULL DEFAULT 0,
						device_id VARCHAR(48) NULL DEFAULT NULL,
						push_token VARCHAR(256) NULL DEFAULT NULL
					);`
		sqlQuery.executeQuery([query]).then((result)=>{
			if(result[0]['warningCount'] == 0){
				insertAdminValues(admins).then(()=>{
					resolve()
				}).catch((err)=>{
					console.log(err)
					reject(err)
				})
			}else{
				resolve()				
			}
		}).catch((err)=>{
			reject(err)
		})
	})
}

var createIWSTable = ()=>{
	return new Promise((resolve, reject)=>{
		let query = `CREATE TABLE IF NOT EXISTS iws (
						id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
						iws_code VARCHAR(16) NOT NULL,
						ddt_code VARCHAR(4) NOT NULL,
						name VARCHAR(64) NULL,
						email VARCHAR(64) NULL,
						primary_mobile VARCHAR(10) NULL,
						secondary_mobile VARCHAR(10) NULL,
						password VARCHAR(255) NULL, 
						first_time_login boolean NOT NULL DEFAULT true,
						last_login_time VARCHAR(32), 
						failed_login_attempts INT NOT NULL DEFAULT 0,
						device_id VARCHAR(48) NULL DEFAULT NULL,
						push_token VARCHAR(256) NULL DEFAULT NULL,
						UNIQUE(iws_code)
					);`
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}

var createProductsTable = ()=>{
	return new Promise((resolve, reject)=>{
		let query = `CREATE TABLE IF NOT EXISTS products(
						id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
						product_category VARCHAR(32) NOT NULL,
						product_name VARCHAR(32) NOT NULL,
						product_level VARCHAR(1) NOT NULL,
						base_price FLOAT NOT NULL DEFAULT 0,
						discount FLOAT NOT NULL DEFAULT 0,
						UNIQUE(product_category, product_name, product_level)
					);`
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})				
	})
}

var createTargetTable = ()=>{
	return new Promise((resolve, reject)=>{
		let query = `CREATE TABLE IF NOT EXISTS targets(
						id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
						ddt_code VARCHAR(4) NOT NULL,
						ddt_name VARCHAR(64) NULL,
						iws_code VARCHAR(16) NOT NULL,
						loc_code VARCHAR(3) NOT NULL,
						iws_ticket VARCHAR(32) NOT NULL,
						target_date VARCHAR(11) NOT NULL,
						product_id INT NOT NULL,
						target_quantity INT NOT NULL,
						ticket_number VARCHAR(32) NOT NULL,
						UNIQUE(iws_code, target_date, product_id)
					);`
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}

var createUploadsTable = ()=>{
	return new Promise((resolve, reject)=>{
		let query = `CREATE TABLE IF NOT EXISTS uploads(
						id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
						ddt_code VARCHAR(4) NOT NULL,
						ddt_name VARCHAR(64) NULL,
						iws_code VARCHAR(16) NOT NULL,
						loc_code VARCHAR(3) NOT NULL,
						iws_category VARCHAR(32) NOT NULL,
						upload_date VARCHAR(11) NOT NULL,
						product_id INT NOT NULL,
						target_quantity FLOAT NOT NULL,
						target_value FLOAT NOT NULL,
						UNIQUE(iws_code, product_id, upload_date)
					);`
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}

var createRequestsTable = ()=>{
	return new Promise((resolve, reject)=>{
		let query = `CREATE TABLE IF NOT EXISTS requests(
						id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
						iws_code VARCHAR(16) NOT NULL,
						ddt_code VARCHAR(4) NOT NULL,
						request_date VARCHAR(11) NOT NULL,
						product_id INT NOT NULL,
						target_quantity INT NOT NULL,
						status VARCHAR(1) NOT NULL DEFAULT 'P',
						timestamp INT NOT NULL,
						UNIQUE(iws_code, product_id, request_date)
					);`
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}

var createTables = ()=>{
	return new Promise((resolve, reject)=>{
		console.log("[*] Creating neccessary tables (if not exists)")
		createAdminTable().then(()=>{
			createIWSTable().then(()=>{
				createProductsTable().then(()=>{
					createTargetTable().then(()=>{
						createUploadsTable().then(()=>{
							createRequestsTable().then(()=>{
								resolve()
							}).catch((err)=>{
								reject(err)
							})
						}).catch((err)=>{
							reject(err)
						})
					}).catch((err)=>{
						reject(err)
					})
				}).catch((err)=>{
					reject(err)
				})
			}).catch((err)=>{
				reject(err)
			})
		}).catch((err)=>{
			reject(err)
		})
	})
}

module.exports = {
	createDatabase: createDatabase,
	createTables: createTables,
	insertAdminValues: insertAdminValues
}