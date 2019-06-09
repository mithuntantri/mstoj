var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('client-sessions');
var passport = require('passport');
var dbConn = require('./database/databaseConnection');
var jwt = require('jwt-simple');
var redis = require('redis');
var moment = require('moment');
var exec = require('child_process').exec;

var config = require("./database/rethinkConfig")
var r = require('rethinkdb')

var index = require('./routes/index');
var admin = require('./routes/admin');
var login = require('./routes/login');
var register = require('./routes/register');
var user = require('./routes/user');

var app = express();
var sql_Query = require('./database/sqlWrapper');
var mysqlOps = require('./store/mysqlOps');

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token, Authorization, Page');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Expose-Headers', 'X-Api-Version, X-Request-Id, X-Response-Time');
    res.setHeader('Access-Control-Max-Age', '1000');
    next();
};
app.use(allowCrossDomain);


//Starting Redis Server
redis_client = redis.createClient({
  port: process.env.TS_REDIS_PORT,
  host: process.env.TS_REDIS_HOST
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json({limit:'150mb'}));
app.use(bodyParser.urlencoded({extended:true, limit:'150mb'}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));

app.use(session({
    cookieName : 'session',
    secret : 'eg[isfd-8yF9-7w1970df{}+Ijsli;;to9',
    duration : 10 * 60 * 1000,
    activeDuration : 5*60*1000,
    httpOnly : true,
    secure : true
}));

//passport initializatoin
app.use(passport.initialize());
app.use(passport.session());


// Middleware that will create a connection to rethinkdb
app.use(createConnection)

var baseUrl = process.env.TS_BASE_URL;

app.use('/', index);
app.use(baseUrl + '/admin', admin);
app.use(baseUrl + '/login', login);
app.use(baseUrl + '/register', register);
app.use(baseUrl + '/user', user);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

passport.serializeUser(function (user, done) {
    done(null, {
        'username':user.username,
        'id':user.id,
        'admin_type' : user.admin_type,
        'email' : user.email,
        'name' : user.name,
        'access_level': user.access_level
    });
});

passport.deserializeUser(function (id, done) {
    if(id.access_level == 'admin'){
      dbConn(function (err, con) {
        var query = "SELECT * FROM `admin` WHERE username = '" + id.username + "'";
        con.query(query, function (err, data) {
            if (!data) {
                done(err, null);
            }else {
                con.release();
                data[0].access_level = id.access_level;
                done(err, data[0]);
            }
        });
      });
    }else{
      dbConn(function (err, con) {
        var query = "SELECT * FROM `iws` WHERE id = '" + id.id + "'";
        con.query(query, function (err, data) {
            if (!data) {
                done(err, null);
            }else {
                con.release();
                data[0].access_level = id.access_level;
                done(err, data[0]);
            }
        });
      });
    }
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.render('error');
});

app.use(closeConnection)

function restartInstance(command, callback){
    exec(command, function(error, stdout, stderr){ callback(stdout); });
}

function restartRethink(){
  app.use(closeConnection)
  app.use(createConnection)
}

/*
 * Send back a 500 error
 */
function handleError(res) {
    return function(error) {
        res.send(500, {error: error.message});
    }
}

/*
 * Create a RethinkDB connection, and save it in req._rdbConn
 */
function createConnection(req, res, next) {
    r.connect(config.rethinkdb).then(function(conn) {
        req._rdbConn = conn;
        next();
    }).error(handleError(res));
}

/*
 * Close the RethinkDB connection
 */
function closeConnection(req, res, next) {
    req._rdbConn.close();
}

mysqlOps.createDatabase()

module.exports = app;
