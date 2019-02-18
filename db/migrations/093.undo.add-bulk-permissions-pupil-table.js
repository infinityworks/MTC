'use strict'

const config = require('../config')

module.exports.generateSql = function () {
  return `REVOKE ALTER ON [mtc_admin].[pupil] TO ${config.Application.Username}`
}
