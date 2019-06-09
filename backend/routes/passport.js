var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
var sqlQuery = require('../database/sqlWrapper');
var jwt = require('jwt-simple');
var _ = require('underscore');

module.exports = function(passport){
    var opts = {};
    let redis_key, query;
    opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
    opts.secretOrKey = 'eg[isfd-8axcewfgi43209=1dmnbvcrt67890-[;lkjhyt5432qi24';
    passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
    	console.log("jwt_payload", jwt_payload)
      if(jwt_payload.access_level == 'admin'){
        query = "SELECT * FROM `admin` WHERE username = '" + jwt_payload.username + "'";
      }else{
        query = "SELECT * FROM `iws` WHERE id = '" + jwt_payload.id + "'";
      }
      sqlQuery.executeQuery([query]).then((results) => {
            if(!("type" in jwt_payload)){
                delete results[0][0].password;
                if(jwt_payload.access == 'subuser'){
                    redis_key = results[0][0].subuser_id;
                }else{
                    redis_key = results[0][0].username;
                }

                if(Object.keys(results[0]).length > 0){
                	results[0][0]["username"] = jwt_payload.username
                    results[0][0]["ddt_code"] = jwt_payload.ddt_code
                    results[0][0]["access_level"] = jwt_payload.access_level;
                    results[0][0]['name'] = jwt_payload.name;
                    results[0][0]["primary_mobile"] = jwt_payload.primary_mobile
                    redis_client.hgetall(redis_key, (err,reply) => {
                        done(null, results[0][0]);
                    })
                }else {
                    done(null, false);
                }
            }else if ("type" in jwt_payload && jwt_payload.type==="email_validation"){
                    // console.log("the email validation went successfully");
                    done(null, results[0][0]);
            }
        }).catch((error) => {
            return done(null, false);
        });
    }))
};
