'use strict'

const config = require('../config')

const createAzureUser = `CREATE USER ${config.Application.Username} WITH PASSWORD ='${config.Application.Password}', DEFAULT_SCHEMA=[mtc_admin];`

const createLocalSqlUser = `CREATE LOGIN ${config.Application.Username} WITH PASSWORD = '${config.Application.Password}'; USE ${config.Database}; CREATE USER ${config.Application.Username} FOR LOGIN ${config.Application.Username} WITH DEFAULT_SCHEMA = [mtc_admin];`

// TODO test on sql azure
module.exports.generateSql = function () {
  if (config.Azure.Scale) {
    return createAzureUser
  } else {
    return createLocalSqlUser
  }
}
