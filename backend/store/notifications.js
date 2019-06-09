var https = require('https');
var express = require('express');
var sqlQuery = require('../database/sqlWrapper');
let _ = require("underscore");
var moment = require('moment')

const APP_ID = '39eaafab-b693-4bfb-93da-89fb2ea64a33'
const REST_API_AUTH = 'NjhjZWFmODQtNTkxYS00MDA1LTlhYjctZDc3YWI0ZWJlYTY0'
const AUTH_KEY = 'MDcxMjE5N2ItNDdiYy00ZDM1LWFmZDMtZDY0ODhhYjYwNGRj'

var sendNotification = function(data) {
  return new Promise((resolve, reject)=>{
    var headers = {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": "Basic " + REST_API_AUTH
    };
    
    var options = {
      host: "onesignal.com",
      port: 443,
      path: "/api/v1/notifications",
      method: "POST",
      headers: headers
    }
    console.log(options)
  
    var req = https.request(options, function(res) {  
      res.on('data', function(data) {
        console.log("Response:");
        console.log(JSON.parse(data));
        resolve(data)
      });
    });
    
    req.on('error', function(e) {
      console.log("ERROR:");
      console.log(e);
      reject(e)
    });
    
    req.write(JSON.stringify(data));
    req.end();
  })
};

var sendSpecificDeviceNotification = (username, access_level, send_to, data)=>{
  return new Promise((resolve, reject)=>{
    let query
    if(access_level == 'user'){
      query = `SELECT * FROM admin WHERE username='${send_to}'`
    }else if(access_level == 'admin'){
      query = `SELECT * FROM iws WHERE iws_code='${send_to}'`
    }
    sqlQuery.executeQuery([query]).then((result)=>{
      console.log(result)
      var device_ids = []
      _.each(result[0], (r)=>{
        console.log("r", r)
        device_ids.push(r.device_id)
      })
      var message = { 
        app_id: APP_ID,
        data: data,
        contents: {"en": data.message},
        headings: {"en": data.title},
        include_player_ids: device_ids
      };
      sendNotification(message).then(()=>{
        resolve()      
      }).catch((err)=>{
        reject(err)
      })
    }).catch((err)=>{
      reject(err)
    })
  })
}

var broadcastMessage = (username, title, message, category)=>{
  return new Promise((resolve, reject)=>{
    let date = moment().format("DD MMM YYYY")
    let timestamp = moment().unix()
    let query = `INSERT INTO announcements (username, date, timestamp, title, message,category) VALUES('${username}', '${date}', ${timestamp},'${title}', '${message}', 'ALL')`
    sqlQuery.executeQuery([query]).then(()=>{
      var nmessage = { 
        app_id: APP_ID,
        data: {message: message, title: title},
        contents: {"en": message},
        headings: {"en": title},
        included_segments: ["All"],
      };
      console.log(nmessage)
      sendNotification(nmessage).then(()=>{
        resolve()      
      }).catch((err)=>{
        reject(err)
      })
    }).catch((err)=>{
        reject(err)
      })
  })  
}

var broadcastCategoryMessage = (username, title, message, category)=>{
  return new Promise((resolve, reject)=>{
    let date = moment().format("DD MMM YYYY")
    let timestamp = moment().unix()
    let query1 = `SELECT device_id FROM employees WHERE designation='${category}'`
    let query2 = `INSERT INTO announcements (username, date, timestamp, title, message,category) VALUES('${username}', '${date}', ${timestamp},'${title}', '${message}', '${category}')`
    sqlQuery.executeQuery([query1, query2]).then((result)=>{
      let device_ids = _.pluck(result[0], 'device_id')
      console.log(device_ids)
      var message = { 
        app_id: APP_ID,
        data: {title: title, message: message},
        contents: {"en": message},
        headings: {"en": title},
        included_segments: ["All"],
        include_player_ids: device_ids
      };
      console.log(message)
      sendNotification(message).then(()=>{
        resolve()      
      }).catch((err)=>{
        reject(err)
      })
    }).catch((err)=>{
      reject(err)
    })
  })  
}

module.exports = {
  broadcastMessage: broadcastMessage,
  sendSpecificDeviceNotification: sendSpecificDeviceNotification,
  broadcastCategoryMessage: broadcastCategoryMessage
}