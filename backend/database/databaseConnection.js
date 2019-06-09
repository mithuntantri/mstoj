/**
 * Created by vikram on 1/2/17.
 */
var express   =    require("express");
var mysql     =    require('mysql');
var connProperties = require('../database/dbConfig');

var pool      =    mysql.createPool(connProperties.connection);

var getConnection = function (callback) {
    pool.getConnection(function (error, connection) {
        if(error){
            return callback(error);
        }
        callback(error, connection);			
    });
};

module.exports = getConnection;
