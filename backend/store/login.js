var hash = require('bcryptjs');
var otplib = require('otplib').default;
var jwt = require('jwt-simple');
var sqlQuery = require('../database/sqlWrapper');
var moment = require('moment')
let _ = require("underscore");
var rethinkOps = require('../store/rethinkOps');
var otplib = require('otplib').default;
var request = require('request');

var updateLastLoginTime = (username, last_login_time)=>{
	return new Promise((resolve, reject)=>{
		let query = `UPDATE admin SET last_login_time='${last_login_time}' WHERE username='${username}'`
		sqlQuery.executeQuery([query]).then(()=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}

var updatFailedLoginAttempts = (username, failed_login_attempts)=>{
	return new Promise((resolve, reject)=>{
		let query = `UPDATE admin SET failed_login_attempts=${failed_login_attempts} WHERE username='${username}'`
		sqlQuery.executeQuery([query]).then(()=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}

var AdminLogin = (username, password)=>{
	return new Promise((resolve, reject)=>{
		if(!username || !password){
	        reject("Invalid Username / Password")
	    }else{
	    	let query = `SELECT * FROM admin WHERE username='${username}'`
	    	sqlQuery.executeQuery([query]).then((result)=>{
	    		if(result[0].length > 0){
	    			let dbPassword = result[0][0].password
	    			let failed_login_attempts = result[0][0].failed_login_attempts
	    			if(failed_login_attempts > 3){
	    				reject("Account is blocked for multiple unauthorized access. Please contact administrator!")
	    			}
	    			hash.compare(password, dbPassword, function(err, match){
	    				if (!match) {
					    	failed_login_attempts++
					        updatFailedLoginAttempts(username, failed_login_attempts);
					        reject("Invalid Username / Password");
					    }
					    var encodeDetails = {};
					    encodeDetails['username'] = result[0][0].username;
					    encodeDetails['id'] = result[0][0].id;
					    encodeDetails['exp'] = moment().add(180, 'm').valueOf()
					    encodeDetails['admin_type'] = result[0][0].admin_type;
					    encodeDetails['name'] = result[0][0].name;
					    encodeDetails['email'] = result[0][0].email
					    encodeDetails['access_level'] = 'admin'

					    let token = jwt.encode(encodeDetails, 'eg[isfd-8axcewfgi43209=1dmnbvcrt67890-[;lkjhyt5432qi24');
					    token = 'JWT ' + token
					    redis_client.hmset(username, 'token', token, 'attempts', 3);
					    redis_client.expire(username, 180 * 60);

					    updateLastLoginTime(username, moment().unix())
					    resolve({token: token, admin_type: result[0][0].admin_type, name: result[0][0].name})
	    			});
	    		}else{
	    			reject("Invalid Username / Password")
	    		}
	    	})
	    }
	})
}

var UpdatFailedAttempt = (username, failed_login_attempts)=>{
	return new Promise((resolve, reject)=>{
		let query = `UPDATE iws SET failed_login_attempts=${failed_login_attempts} where iws_code='WKA0${username}'`
		sqlQuery.executeQuery([query]).then(()=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}

var UserLogin = (username, password)=>{
	return new Promise((resolve, reject)=>{
		let query = `SELECT * FROM iws where iws_code='WKA0${username}'`
		sqlQuery.executeQuery([query]).then((result)=>{
			if(result[0].length > 0){
				if(result[0][0].password && result[0][0].failed_login_attempts < 3){
					hash.compare(password, result[0][0].password, function(err, match){
						if (!match) {
					        UpdatFailedAttempt(username, result[0][0].failed_login_attempts+1);
					        reject(`Invalid Username (IWS Code) / Password`)
					    }else{
					    	sendOTPWrapper(result[0][0].primary_mobile).then((result)=>{
								resolve(`OTP sent successfully`)													
							}).catch((err)=>{
								reject(`You have exceeded maximum limit. Please try again after 10 minutes`)
							})	
					    }
					});
				}else if(result[0][0].failed_login_attempts >=3){
				    UpdatFailedAttempt(username, result[0][0].failed_login_attempts+1);
					reject(`Username (IWS Code) blocked for multiple failed attempts. Please contact administrator`)
				}else{
					reject(`Username (IWS Code) not registered. Please register`)
				}
			}else{
				reject(`Invalid Username (IWS Code) / Password`)
			}
		})
	})
}

var sendOTPWrapper = (mobile)=>{
	console.log(mobile)
	return new Promise((resolve, reject)=>{
		var secret = otplib.authenticator.generateSecret();
    	var token = otplib.authenticator.generate(secret);
    	console.log(token)
    	var message = 'Welcome from CAPQUO! Your one time password (OTP) for registration is ' + token + '. Please do not share this OTP with anyone!'
    	console.log(message)
    	var verificationUrl = "https://www.mobtexting.com/app/index.php/api?method=sms.normal&api_key=756f609dbdb4b23044297ed06d6b53359f7c4da3&to="+ mobile +"&sender=CAPQUO&message="+message+"";
    	console.log(verificationUrl)
	    redis_client.hgetall(mobile,function (err,reply) {
	    	console.log(err, reply)
	      if(err){
	      	console.log(err)
	        reject(err)
	      }
	      if(reply == null){
	        redis_client.hmset(mobile, 'otp', token, 'resend_attempts', 3, 'verify_attempts', 3);
	        redis_client.expire(mobile, 120);
	        request(verificationUrl,function(error,response,body) {
	          if(error){
	            reject(error)
	          }else{
	            resolve()
	          }
	        })
	        resolve()
	      }else if(reply != null && reply.attempts > 1){
	        redis_client.hmset(mobile, 'otp', token, 'resend_attempts', parseInt(reply.resend_attempts)-1, 'verify_attempts', reply.verify_attempts);
	        redis_client.expire(mobile, 120);
	        request(verificationUrl,function(error,response,body) {
	          if(error){
	            reject(error)
	          }else{
	            resolve()
	          }
	        })
	        resolve()
	      }else{
	        redis_client.hmset(mobile, 'otp', token, 'resend_attempts', 0, 'verify_attempts', reply.verify_attempts);
	        redis_client.expire(mobile, 0);
	        resolve()
	      }
	    })
	})
}

var UserRegister = (username, mobile_number)=>{
	return new Promise((resolve, reject)=>{
		let query = `SELECT * FROM iws WHERE iws_code='WKA0${username}'`
		sqlQuery.executeQuery([query]).then((result)=>{
			if(result[0].length > 0){
				if(result[0][0].password){
					reject(`Username (IWS Code) already registered`)
				}else{
					sendOTPWrapper(mobile_number).then((result)=>{
						query = `UPDATE iws SET primary_mobile='${mobile_number}' WHERE iws_code='WKA0${username}'`
						sqlQuery.executeQuery([query]).then(()=>{
							resolve(`OTP sent successfully`)													
						})
					}).catch((err)=>{
						reject(`You have exceeded maximum limit. Please try again after 10 minutes`)
					})
				}
			}else{
				reject(`Invalid Username (IWS Code)`)
			}
		})
	})
}

var ResendOTP = (username)=>{
	return new Promise((resolve, reject)=>{
		let query = `SELECT * FROM iws where iws_code='WKA0${username}'`
		sqlQuery.executeQuery([query]).then((result)=>{
			if(result[0].length > 0){
				if(result[0][0].primary_mobile){
					sendOTPWrapper(result[0][0].primary_mobile).then((result)=>{
						resolve(`OTP resent successfully`)
					}).catch((err)=>{
						reject(`You have exceeded maximum limit. Please try again after 10 minutes`)
					})
				}else{
					reject(`Invalid Mobile Number`)
				}
			}else{
				reject(`Invalid Username (IWS Code)`)
			}
		})
	})
}

var verifyOTPWrapper = (mobile, otp)=>{
	console.log(mobile, otp)
	return new Promise((resolve, reject)=>{
		redis_client.hgetall(mobile,function (err,reply) {
			console.log(err, reply)
	        if(err){
	            reject(`Something went wrong. Please try again`)
	        }
	        if(reply == null){
	            reject(`OTP is expired. Please try again`)
	        }else if(parseInt(reply.verify_attempts) <= 0){
	        	reject(`Exceeded maximum limit. Please try again after 10 minutes`)
	        }else if(otp == reply.otp){
	            resolve(`OTP verified successfully`)
	        }else{
	        	redis_client.hmset(mobile, 'otp', reply.otp, 'resend_attempts', reply.resend_attempts, 'verify_attempts', parseInt(reply.verify_attempts)-1);
	        	redis_client.expire(mobile, 120);
	            resolve(`Invalid OTP. You have ${parseInt(reply.verify_attempts)-1} attempts to verify`)
	        }
	    });
	})
}

var VerifyOTP = (username, otp)=>{
	return new Promise((resolve, reject)=>{
		let query = `SELECT * FROM iws where iws_code='WKA0${username}'`
		sqlQuery.executeQuery([query]).then((result)=>{
			console.log(result)
			if(result[0].length > 0){
				if(result[0][0].primary_mobile){
					verifyOTPWrapper(result[0][0].primary_mobile, otp).then((result)=>{
						resolve(result)
					}).catch((err)=>{
						reject(`You have exceeded maximum limit. Please try again after 10 minutes`)
					})
				}else{
					reject(`Invalid Mobile Number`)
				}
			}else{
				reject(`Invalid Username (IWS Code)`)
			}
		})
	})
}

var GenerateToken = (username)=>{
	return new Promise((resolve, reject)=>{
		let query = `SELECT * FROM iws WHERE iws_code='WKA0${username}'`
		let encodeDetails = {};
		sqlQuery.executeQuery([query]).then((result)=>{
			encodeDetails['username'] = result[0][0].iws_code;
			encodeDetails['ddt_code'] = result[0][0].ddt_code;
		    encodeDetails['id'] = result[0][0].id;
		    encodeDetails['email'] = result[0][0].email;
		    encodeDetails['exp'] = moment().add(180, 'h').valueOf()
		    encodeDetails['primary_mobile'] = result[0][0].primary_mobile;
		    encodeDetails['secondary_mobile'] = result[0][0].secondary_mobile;
		    encodeDetails['name'] = result[0][0].name;

		    const token = jwt.encode(encodeDetails, 'eg[isfd-8axcewfgi43209=1dmnbvcrt67890-[;lkjhyt5432qi24');
	        redis_client.hmset(username, 'token', token, 'attempts', 3);
	        redis_client.expire(username, 180 * 60 * 60);
			resolve(token)
		})
	})
}

var SetPassword = (username, password)=>{
	return new Promise((resolve, reject)=>{
		hash.genSalt(15, function (error, salt) {
	        hash.hash(password, salt, function (err, hashed) {
	        	let query = `UPDATE iws SET password='${hashed}' WHERE iws_code='WKA0${username}'`
	        	sqlQuery.executeQuery([query]).then(()=>{
	        		GenerateToken(username).then((token)=>{
	        			resolve({'message': 'User registered successfully', 'token': token})
	        		}).catch((err)=>{
	        			reject(`Something went wrong. Please try again`)
	        		})
	        	}).catch((err)=>{
	        		reject(`Something went wrong. Please try again`)
	        	})
	        })
	    })
	})
}

var ValidateToken = (username, token)=>{
	return new Promise((resolve, reject)=>{
		resolve()
	})
}

var updateDeviceInfo = (username, access_level, device_id, push_token)=>{
	return new Promise((resolve, reject)=>{
		let query
		if(access_level == 'admin'){
			query = `UPDATE admin SET device_id='${device_id}', push_token='${push_token}' WHERE username='${username}'`
		}else if(access_level = 'user'){
			query = `UPDATE iws SET device_id='${device_id}', push_token='${push_token}' WHERE iws_code='${username}'`
		}
		console.log(query)
		sqlQuery.executeQuery([query]).then(()=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}

module.exports = {
	AdminLogin : AdminLogin,
	UserLogin : UserLogin,
	UserRegister: UserRegister,
	ResendOTP: ResendOTP,
	VerifyOTP: VerifyOTP,
	SetPassword: SetPassword,
	ValidateToken: ValidateToken,
	GenerateToken: GenerateToken,
	updateDeviceInfo: updateDeviceInfo
}