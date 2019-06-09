module.exports = {
  rethinkdb: {
    host: process.env.TS_RETHINK_HOST,
    port: process.env.TS_RETHINK_PORT,
    db: process.env.TS_RETHINK_DBNAME,
    user: process.env.TS_RETHINK_USER,
    password: process.env.TS_RETHINK_PASS
  }
}
