'use strict'

const config = require('./config')
const Request = require('tedious').Request
const Connection = require('tedious').Connection

const executeShort = (sql) => {
  const connection = new Connection(tediousConfig())
  return executeFull(connection, sql)
}

const executeFull = (connection, sql) => {
  return new Promise((resolve, reject) => {
    let results = []
    // http://tediousjs.github.io/tedious/api-request.html
    var request = new Request(sql, function (err, rowCount) {
      connection.close()
      if (err) {
        return reject(err)
      }
      return resolve(results)
    })

    request.on('row', function (cols) {
      results.push(cols)
    })
    connection.execSql(request)
  })
}

function tediousConfig () {
  return {
    appName: config.Application.Name,
    userName: config.Migrator.Username,
    password: config.Migrator.Password,
    server: config.Server,
    debug: true,
    options: {
      database: config.Database,
      encrypt: config.Encrypt,
      requestTimeout: config.Migrator.Timeout,
      port: config.Port,
      connectTimeout: config.Migrator.Timeout
    }
  }
}

module.exports = {
  execute: executeShort
}
