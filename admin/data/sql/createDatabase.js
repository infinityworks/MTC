'use strict'

const Request = require('tedious').Request
const Connection = require('tedious').Connection
const config = require('../../config')
const logger = require('../../services/log.service').getLogger()

const adminConfig = {
  appName: config.Sql.Application.Name,
  userName: config.Sql.Migrator.Username,
  password: config.Sql.Migrator.Password,
  server: config.Sql.Server,
  debug: true,
  options: {
    database: 'master',
    encrypt: config.Sql.Encrypt,
    requestTimeout: config.Sql.Migrator.Timeout,
    port: config.Sql.Port,
    connectTimeout: config.Sql.Migrator.Timeout
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
    if (config.Sql.Azure.Scale) {
      azureOnlyScaleSetting = `(SERVICE_OBJECTIVE = '${config.Sql.Azure.Scale}')`
    }
    logger.info(`attempting to create database ${config.Sql.Database} ${azureOnlyScaleSetting} if it does not already exist...`)
    const createDbSql = `IF NOT EXISTS(SELECT * FROM sys.databases WHERE name='${config.Sql.Database}') 
    BEGIN CREATE DATABASE [${config.Sql.Database}] ${azureOnlyScaleSetting}; SELECT 'Database Created'; END ELSE SELECT 'Database Already Exists'`
    const output = await executeRequest(connection, createDbSql)
    logger.info(output[0][0].value)
  } catch (error) {
    console.error(error)
  }
}

const main = () => {
  return new Promise((resolve, reject) => {
    logger.info(`attempting to connect to ${adminConfig.server} on ${adminConfig.options.port} within ${adminConfig.options.connectTimeout}ms`)
    const connection = new Connection(adminConfig)
    connection.on('connect', async (err) => {
      if (err) {
        logger.error(`Connection error 1: ${err.message}`)
        return reject(err)
      }
      logger.info('About to create new database')
      await createDatabase(connection)
      logger.info('DB Created')
      connection.close()
      resolve()
    })
    connection.on('error', (error) => {
      logger.error(`Connection error 2: ${error.message}`)
      return reject(error)
    })
    connection.on('debug', (text) => {
      logger.info(`connection debug: ${text}`)
    })
    connection.on('infoMessage', (info) => {
      logger.info(`server info message: ${info.message}`)
    })
    connection.on('errorMessage', (info) => {
      logger.info(`server error message: ${info.message}`)
    })
  })
}

// NB `main` return a Promise because it wraps the `connection.on()` call.  It CAN be awaited on.
module.exports = main
