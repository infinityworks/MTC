'use strict'

require('dotenv').config()
const toBool = require('to-bool')

const oneMinuteInMilliseconds = 60000

module.exports = {
  Database: process.env.SQL_DATABASE || 'mtc',
  Server: process.env.SQL_SERVER || 'localhost',
  Port: process.env.SQL_PORT || 1433,
  Timeout: process.env.SQL_TIMEOUT || oneMinuteInMilliseconds,
  Encrypt: true,
  Application: {
    Name: process.env.SQL_APP_NAME || 'mtc-local-dev', // docker default
    Username: process.env.SQL_APP_USER || 'mtcAdminUser', // docker default
    Password: process.env.SQL_APP_USER_PASSWORD || 'your-chosen*P4ssw0rd_for_dev_env!' // docker default
  },
  Pooling: {
    MinCount: process.env.SQL_POOL_MIN_COUNT || 100,
    MaxCount: process.env.SQL_POOL_MAX_COUNT || 200,
    LoggingEnabled: process.env.hasOwnProperty('SQL_POOL_LOG_ENABLED') ? toBool(process.env.SQL_POOL_LOG_ENABLED) : false
  },
  Migrator: {
    Username: process.env.SQL_ADMIN_USER || 'sa', // docker default
    Password: process.env.SQL_ADMIN_USER_PASSWORD || 'Mtc-D3v.5ql_S3rv3r', // docker default
    Timeout: process.env.SQL_MIGRATION_TIMEOUT || oneMinuteInMilliseconds * 2
  },
  Azure: {
    Scale: process.env.SQL_AZURE_SCALE
  }
}
