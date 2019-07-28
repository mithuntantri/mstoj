var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var passport = require('passport');
require('../routes/passport')(passport);
var sqlQuery = require('../database/sqlWrapper');
var moment = require('moment')
let _ = require("underscore");
var user = require('../store/user')

router.get('/userDetails', passport.authenticate('jwt', {session: true}), (req, res, next) => {
  console.log(req.session.passport)
  let username = req.session.passport.user.username
  console.log("username", username)
  new Promise((resolve, reject)=>{
    user.UserDetails(username).then((data)=>{
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


router.put('/userDetails', passport.authenticate('jwt', {session: true}), (req, res, next) => {
  console.log(req.session.passport)
  let username = req.session.passport.user.username
  console.log("username", username)
  new Promise((resolve, reject)=>{
    if(req.body.email && req.body.primary_mobile && req.body.secondary_mobile){
      user.updateUserDetails(username, req.body).then((data)=>{
        resolve(data)
      }).catch((err)=>{
        reject(err)
      })
    }else{
      reject(`Something went wrong`)
    }
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})


router.post('/request', passport.authenticate('jwt', {session: true}), (req, res, next)=>{
  new Promise((resolve, reject)=>{
    console.log(req.session.passport)
    user.submitRequest(req.session.passport.user, req.body).then(()=>{
      console.log("Resolved")
      resolve()
    }).catch((err)=>{
      console.log(err)
      reject(err)
    })
  }).then(()=>{
    console.log("done")
    res.json({'status': true, 'message': 'Request submitted successfully'})
  }).catch((err)=>{
    console.log(err)
    res.json({'status': false, 'message': err})
  })
})

router.get('/product/categories', passport.authenticate('jwt', {session: true}), (req, res, next) => {
  console.log(req.session.passport)
  let username = req.session.passport.user.username
  console.log("username", username)
  new Promise((resolve, reject)=>{
    user.ProductCategories().then((data)=>{
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

router.get('/product/names', passport.authenticate('jwt', {session: true}), (req, res, next) => {
  console.log(req.session.passport)
  let username = req.session.passport.user.username
  console.log("username", username)
  new Promise((resolve, reject)=>{
    user.AllProducts().then((data)=>{
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

function redoGetTargets(username, current_date, count){
  return new Promise((resolve, reject)=>{
    if(count < 10){
      user.GetAllTargets(username, current_date).then((data)=>{
        if(data.length > 0){
          resolve(data)          
        }else{
          count++
          current_date = moment().subtract(count, 'days').format("MMM YYYY")
          redoGetTargets(username, current_date, count).then((data)=>{
            resolve(data)
          })
        }
      }).catch((err)=>{
        reject(err)
      })
    }else{
      resolve([])
    }
  })
}

router.get('/targets', passport.authenticate('jwt', {session: true}), (req, res, next) => {
  console.log(req.session.passport)
  let username = req.session.passport.user.username
  console.log("username", username)
  let current_date = moment().format("MMM YYYY")
  new Promise((resolve, reject)=>{
    redoGetTargets(username, current_date, 0).then((data)=>{
      resolve(data)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.get('/requests', passport.authenticate('jwt', {session: true}), (req, res, next)=>{
  let username = req.session.passport.user.username
  new Promise((resolve, reject)=>{
    user.getAllRequests(username).then((result)=>{
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
