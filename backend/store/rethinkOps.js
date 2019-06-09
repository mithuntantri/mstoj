var r = require('rethinkdb');
var config = require('../database/rethinkConfig');
var _ = require('underscore')
var moment = require('moment')
var sql_Query = require('../database/sqlWrapper');
var store = require("../store/store")

var insertData = function(table_name, data) {
  return new Promise ((resolve, reject)=>{
    r.table(table_name).insert(data)
    .run(store.rethink_conn, (err, result)=>{
      if(err) {
        reject()
      }else{
        resolve()
      }
    })
  })
};

var getData = function(table_name, data) {
  return new Promise ((resolve, reject)=>{
    r.table(table_name).get(data)
    .run(store.rethink_conn, (err, result)=>{
      if(err) {
        reject()
      }else{
        resolve(result)
      }
    })
  })
};

var getUserData = function(table_name, user_id) {
  return new Promise ((resolve, reject)=>{
    r.table(table_name).filter(r.row('user_id').eq(user_id))
    .run(store.rethink_conn, (err, cursor)=>{
      if(err) {
        reject()
      }else{
        cursor.toArray((err, result)=>{
          if(err) reject()
          resolve(result)
        })
      }
    })
  })
};

var updateUserSpecificData = function(table_name,user_id, key, value,data) {
    return new Promise ((resolve, reject)=>{
        r.table(table_name).filter({'user_id':user_id}).filter(r.row(key).eq(value)).update(data)
            .run(store.rethink_conn, (err, result)=>{
                if(err) {
                    //console.log(err);
                    reject(err);
                }else{
                        resolve(result)
                }
            })
    })
};

var deleteUserSpecificData = function(table_name,user_id, key, value,data) {
    return new Promise ((resolve, reject)=>{
        r.table(table_name).filter({'user_id':user_id}).filter(r.row(key).match(value)).delete()
            .run(store.rethink_conn, (err, result)=>{
                if(err) {
                    //console.log(err);
                    reject(err);
                }else{
                        resolve(result)
                }
            })
    })
};

let deleteAllUserData = (tableName,key,value)=>{
    return new Promise((resolve,reject)=>{
        r.table(tableName).filter(r.row(key).match(value)).delete()
            .run(store.rethink_conn, (err, result)=>{
                if(err) {
                    //console.log(err);
                    reject(err);
                }else{
                    resolve(result)
                }
            })
    })
}

var getAllSpecificData = function(table_name) {
    return new Promise ((resolve, reject)=>{
        r.table(table_name)
            .run(store.rethink_conn, (err, cursor)=>{
              console.log("err", err)
                cursor.toArray(function(err, result) {
                    if (err) throw err;
                        resolve(result);
                });
            })
    })
};

var getUserSpecificData = function(table_name,user_id, key, value) {
    return new Promise ((resolve, reject)=>{
        r.table(table_name).filter({'user_id':user_id}).filter(r.row(key).eq(value))
            .run(store.rethink_conn, (err, cursor)=>{
                cursor.toArray(function(err, result) {
                    if (err) throw err;
                        resolve(result);
                });
            })
    })
};




var updateUserDataPartialMatch = function(table_name,user_id, key, value, data) {
    return new Promise ((resolve, reject)=>{
        r.table(table_name).filter({'user_id':user_id}).filter(r.row(key).match(value)).update(data)
            .run(store.rethink_conn, (err,result)=>{
                if(err) {
                    reject()
                }else{
                        resolve(result);
                }
            })
    })
};

var getUserDataPartialMatch = function(table_name,user_id, key, value) {
    return new Promise ((resolve, reject)=>{
        r.table(table_name).filter({'user_id':user_id}).filter(r.row(key).match(value))
          .run(store.rethink_conn, (err,cursor)=>{
            if(err) {
              reject()
            }else{
              cursor.toArray((err, result)=>{
                if(err) reject()
                resolve(result)
              })
            }
          })
    })
};


var removeProperty = function(table_name, id, key){
  return new Promise(function(resolve, reject) {
    r.table(table_name).get(id).replace(r.row.without(key))
    .run(store.rethink_conn, (err, result)=>{
      if(err) {
        reject()
      }else{
        //console.log("resolving", result)
        resolve(result)
      }
    })
  });
}

var updateData = function(table_name, data) {
  return new Promise ((resolve, reject)=>{
    r.table(table_name).get(data.id).update(data)
    .run(store.rethink_conn, (err, result)=>{
      if(err) {
        reject()
      }else{
        //console.log("resolving", result)
        resolve(result)
      }
    })
  })
};

var updateUnseen = function(table_name, user_id, asset){
  return new Promise ((resolve, reject)=>{
    r.table(table_name).filter({'user_id':user_id, 'asset': asset}).update({unseen : false})
      .run(store.rethink_conn, (err, result)=>{
          if(err) {
              //console.log(err);
              reject(err);
          }else{
                  resolve(result)
          }
      })
  })
}

var deleteData = function (table_name, data) {
  return new Promise ((resolve, reject)=>{
    r.table(table_name).get(data).delete()
    .run(store.rethink_conn, (err, result)=>{
      if(err) {
        reject()
      }else{
        resolve()
      }
    })
  })
};

var deleteMultipleData = function (table_name, data) {
  //console.log("Deleting multiple data")
  return new Promise ((resolve, reject)=>{
    getData(table_name, data).then((result)=>{
      //console.log(result.transactions)
      r.table(table_name).get(data).delete()
      .run(store.rethink_conn, (err, res)=>{
        if(err) {
          reject()
        }else{
          resolve()
        }
      })
    })
  })
};

var createRethinkTable = function(table_name){
  return new Promise ((resolve, reject)=>{
    r.tableList()
    .run(store.rethink_conn, (err, table_names)=>{
      if (_.includes(table_names, table_name)) {
        resolve()
      } else {
        r.tableCreate(table_name).run(store.rethink_conn)
        resolve()
      }
    })
  })
};

var createRethinkDatabase = function(){
  return new Promise((resolve, reject)=>{
    r.dbList()
    .run(store.rethink_conn, (err, db_names)=>{
      if (_.includes(db_names, config.rethinkdb.db)) {
        resolve()
      } else {
        r.dbCreate(config.rethinkdb.db).run(store.rethink_conn).finally(function() {
          resolve()
        })
      }
    })
  })
};

var getAllUsers = function(table_name){
  return new Promise(function(resolve, reject) {
    r.table(table_name).pluck(['user_id'])
    .run(store.rethink_conn, (err, cursor)=>{
      cursor.toArray(function(err, result){
        if (err) throw err;
        if(result.length > 0){
            resolve(result)
        } else{
            resolve([])
        }
      })
    })
  });
}

module.exports = {
    createRethinkDatabase : createRethinkDatabase,
    createRethinkTable : createRethinkTable,
    insertData : insertData,
    getData : getData,
    updateUserSpecificData : updateUserSpecificData,
    updateUserDataPartialMatch : updateUserDataPartialMatch,
    getUserDataPartialMatch : getUserDataPartialMatch,
    deleteData : deleteData,
    deleteMultipleData : deleteMultipleData,
    getUserData : getUserData,
    updateUnseen : updateUnseen,
    updateData : updateData,
    getUserSpecificData : getUserSpecificData,
    deleteUserSpecificData : deleteUserSpecificData,
    getAllSpecificData : getAllSpecificData,
    getAllUsers : getAllUsers,
    deleteAllUserData:deleteAllUserData,
    removeProperty : removeProperty
};
