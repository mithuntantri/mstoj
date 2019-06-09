//connection properties
module.exports = {
    'connection' : {
        connectionLimit : 30,
        host     : process.env.TS_MYSQL_HOST,
        user     : process.env.TS_MYSQL_USER,
        password : process.env.TS_MYSQL_PASS,
        database : process.env.TS_MYSQL_DBNAME,
        debug    :  false
    }
};
