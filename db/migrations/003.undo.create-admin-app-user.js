'use strict'

const config = require('../config')

module.exports.generateSql = function () {
  return `DROP USER IF EXISTS ${config.Application.Username};`
}

const dropAzureUser = `DROP USER IF EXISTS ${config.Application.Username};`

const dropLocalSqlUser = `DROP USER ${config.Application.Username}; DROP LOGIN ${config.Application.Username};`

// TODO test on sql azure
module.exports.generateSql = function () {
  if (config.Azure.Scale) {
    return dropAzureUser
  } else {
    return dropLocalSqlUser
  }
}
