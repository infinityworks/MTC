'use strict'

const config = require('../config')

module.exports.generateSql = function () {
  return `GRANT ALTER ON [mtc_admin].[pupil] TO ${config.Application.Username}`
}
