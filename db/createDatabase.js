'use strict'

const Request = require('tedious').Request
const Connection = require('tedious').Connection
const config = require('./config')

const adminConfig = {
  appName: config.Application.Name,
  userName: config.Migrator.Username,
  password: config.Migrator.Password,
  server: config.Server,
  debug: true,
  options: {
    database: 'master',
    encrypt: config.Encrypt,
    requestTimeout: config.Migrator.Timeout,
    port: config.Port,
    connectTimeout: config.Migrator.Timeout
  }
}

const executeRequest = (connection, sql) => {
  return new Promise((resolve, reject) => {
    let results = []
    // http://tediousjs.github.io/tedious/api-request.html
    var request = new Request(sql, function (err, rowCount) {
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

const createDatabase = async (connection) => {
  try {
    let azureOnlyScaleSetting = ''
    if (config.Azure.Scale) {
      azureOnlyScaleSetting = `(SERVICE_OBJECTIVE = '${config.Azure.Scale}')`
    }
    console.log(`attempting to create database ${config.Database} ${azureOnlyScaleSetting} if it does not already exist...`)
    const createDbSql = `IF NOT EXISTS(SELECT * FROM sys.databases WHERE name='${config.Database}')
    BEGIN CREATE DATABASE [${config.Database}] ${azureOnlyScaleSetting}; SELECT 'Database Created'; END ELSE SELECT 'Database Already Exists'`
    const output = await executeRequest(connection, createDbSql)
    console.log(output[0][0].value)
  } catch (error) {
    console.error(error)
  }
}

const main = () => {
  return new Promise((resolve, reject) => {
    console.log(`attempting to connect to ${adminConfig.server} on ${adminConfig.options.port} within ${adminConfig.options.connectTimeout}ms`)
    const connection = new Connection(adminConfig)
    connection.on('connect', async (err) => {
      if (err) {
        console.error(`Connection error 1: ${err.message}`)
        return reject(err)
      }
      console.log('About to create new database')
      await createDatabase(connection)
      console.log('DB Created')
      connection.close()
      resolve()
    })
    connection.on('error', (error) => {
      console.error(`Connection error 2: ${error.message}`)
      return reject(error)
    })
    connection.on('debug', (text) => {
      console.log(`connection debug: ${text}`)
    })
    connection.on('infoMessage', (info) => {
      console.log(`server info message: ${info.message}`)
    })
    connection.on('errorMessage', (info) => {
      console.log(`server error message: ${info.message}`)
    })
  })
}

// NB `main` return a Promise because it wraps the `connection.on()` call.  It CAN be awaited on.
module.exports = main
