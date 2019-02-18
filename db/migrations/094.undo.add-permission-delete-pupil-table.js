'use strict'

const config = require('../config')

module.exports.generateSql = function () {
  return `REVOKE DELETE ON [mtc_admin].[pupil] TO ${config.Application.Username}`
}
