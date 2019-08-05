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
var drill = require('../store/drill')
var user = require('../store/user')

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    var option = req.query.option
    option = option.replace("/", "_")
    option = option.replace(" ", "_")
    option = option.replace(" ", "_")
    option = option.replace("&", "and")
    let dir = './uploads/'
    if(option == 'Upload_Product_Image'){
      dir = './images/'
    }else{
      dir += option + "/"      
    }
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }
    cb(null, dir)
  },
  filename: function (req, file, cb) {
    let admin_id =  req.user.username;
    if(req.query.option == 'Upload Product Image'){
      cb(null, req.query.name.replace(/ /g, '-').toLowerCase()+".jpg")
    }else{
      cb(null, admin_id + '_' + moment().format("DDMMMYYYY") + '.' + file.originalname.split('.').pop())
    }
  }
})
var upload = multer({ storage: storage, limits: { fileSize: '150MB' } }).single('file')

router.post('/login', (req, res, next) => {
  let username = req.body.username
  let password = req.body.password
  new Promise((resolve, reject)=>{
    login.AdminLogin(username, password).then((data)=>{
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

router.post("/upload", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  var option = req.query.option
  option = option.replace("/", "_")
  option = option.replace("&", "and")
  option = option.replace(" ", "_")
  option = option.replace(" ", "_")
  var id, name, is_image = (option=='Upload_Product_Image')?true:false
  var is_distributor = req.user.admin_type == 'DI'
  try{
    new Promise((resolve, reject)=>{
      upload(req,res,function(err){
        var file_name = req.file.filename
        if(err){
          reject(err)
        }else{
          resolve(file_name)
        }
      })
    }).then((file_name)=>{
      if(!is_image){
        var folder_name = option;
        var relative_path = path.resolve("./uploads/" + folder_name) + '/' + file_name
        convert.convertToCSV(option, relative_path).then(()=>{
          res.json({'status': true, 'message' : 'File uploaded successfully'})      
        }).catch((err)=>{
          res.json({'status': false, 'message' : err})
        })  
      }else{
        var relative_path = path.resolve("./images/") + '/' + file_name
        res.json({'status': true, 'message' : 'File uploaded successfully'})      
      }
    }).catch((err)=>{
      res.json({'status': false, 'message' : 'File upload failed! Invalid file format'})
    })
  }catch(err){
    console.log(err)
    res.json({'status': false, 'message': 'File upload failed! Invalid file format'})
  }
})

router.get('/distributor/data', function(req, res, next){
  let code = req.query.code
  let type = req.query.type
  let level = req.query.level
  let param1 = req.query.param1
  let param2 = req.query.param2
  new Promise((resolve, reject)=>{
    if(type == 'dashboard'){
      drill.getDashboardData(code, 0).then((data)=>{
        resolve(data)
      }).catch((err)=>{
        reject(err)
      })
    }else if(type == 'category'){
      drill.getCategoryWiseData(code, level, param1, param2, 0).then((data)=>{
        resolve(data)
      }).catch((err)=>{
        reject(err)
      })
    }else if(type == 'location'){
      drill.getLocationWiseData(code, level, param1, param2, 0).then((data)=>{
        resolve(data)
      }).catch((err)=>{
        reject(err)
      })
    }
  }).then((data)=>{
    res.json({'status': true, 'date': data.date, 'data' : data.result})
  }).catch((err)=>{
    res.json({'status': false, 'message' : err})
  })
})


router.get('/requests', passport.authenticate('jwt', {session: true}), (req, res, next)=>{
  let username = req.session.passport.user.username
  new Promise((resolve, reject)=>{
    user.getAdminRequests(username).then((result)=>{
      resolve(result)
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.get('/getSearchResults', passport.authenticate('jwt', {session: true}), (req, res, next)=>{
  let username = req.session.passport.user.username
  let search = req.query.search
  new Promise((resolve, reject)=>{
    user.getSearchResults(search, username).then((result)=>{
      resolve(result)
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.get('/iwsDetails', passport.authenticate('jwt', {session: true}), (req, res, next)=>{
  let username = req.session.passport.user.username
  let iws_code = req.query.iws_code
  new Promise((resolve, reject)=>{
    user.getIWSDetails(iws_code, username).then((result)=>{
      resolve(result)
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})


router.put('/requests', passport.authenticate('jwt', {session: true}), (req, res, next)=>{
  let username = req.session.passport.user.username
  new Promise((resolve, reject)=>{
    user.updateRequests(username, req.body).then((result)=>{
      resolve(result)
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
