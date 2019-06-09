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

router.post('/userRegister', (req, res, next) => {
  let username = req.body.username
  let mobile_number = req.body.mobile_number
  new Promise((resolve, reject)=>{
    login.UserRegister(username, mobile_number).then((data)=>{
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
    res.json({'status': true, 'data': {'message': data}})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.post('/verifyUser', (req, res, next) => {
  let username = req.body.username
  let otp = req.body.otp
  new Promise((resolve, reject)=>{
    login.VerifyOTP(username, otp).then((data)=>{
      resolve(data)
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': {'message': data}})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.post('/setPassword', (req, res, next) => {
  let username = req.body.username
  let password = req.body.password
  new Promise((resolve, reject)=>{
    login.SetPassword(username, password).then((data)=>{
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
