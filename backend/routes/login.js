var express = require('express');
var shortid = require('shortid');
var router = express.Router();
var passport = require('passport');
var request = require('request');
var hash = require('bcryptjs');
var otplib = require('otplib').default;
var jwt = require('jwt-simple');
require('../routes/passport')(passport);
var sqlQuery = require('../database/sqlWrapper');
var fs = require('fs');
var moment = require('moment')
let _ = require("underscore");
var sql_wrapper = require('../database/sqlWrapper');
var store = require('../store/store')
var multer  = require('multer')
var fs = require('fs');
var path = require('path');
var rethinkOps = require('../store/rethinkOps');
var thumbler = require('video-thumb');
var ffmpeg = require('fluent-ffmpeg');
var child_process = require('child_process')
const getDuration = require('get-video-duration');
var login = require('../store/login')
var convert = require('../store/convert')

router.post('/userLogin', (req, res, next) => {
  let username = req.body.username
  let password = req.body.password
  new Promise((resolve, reject)=>{
    login.UserLogin(username, password).then((data)=>{
      resolve(data)
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.post('/resendOTP', (req, res, next) => {
  let username = req.body.username
  new Promise((resolve, reject)=>{
    login.ResendOTP(username).then((data)=>{
      resolve(data)
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.post('/validateToken', (req, res, next) => {
  let username = req.body.username
  let token = req.body.token
  new Promise((resolve, reject)=>{
    login.ValidateToken(username, token).then((data)=>{
      resolve(data)
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.post('/verifyLogin', (req, res, next) => {
  let username = req.body.username
  let otp = req.body.otp
  new Promise((resolve, reject)=>{
    login.VerifyOTP(username, otp).then((data)=>{
      login.GenerateToken(username).then((token)=>{
        resolve({'message':data, 'token':token})        
      })
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.post('/updateDeviceInfo', passport.authenticate('jwt', {session: true}), (req, res, next)=>{
  var username =  req.session.passport.user.username;
  console.log("username", username)
  let access_level
  if(username.includes("MSDIKA")){
    access_level = "admin"
  }else{
    access_level = "user"
  }
  let device_id = req.body.userId
  let push_token = req.body.pushToken
  console.log(device_id, push_token)
   new Promise((resolve, reject)=>{
    login.updateDeviceInfo(username, access_level, device_id, push_token).then((data)=>{
      resolve(data)
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

module.exports = router;
