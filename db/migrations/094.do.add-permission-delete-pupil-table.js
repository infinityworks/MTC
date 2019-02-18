'use strict'

const config = require('../config')

module.exports.generateSql = function () {
  return `GRANT DELETE ON [mtc_admin].[pupil] TO ${config.Application.Username}`
}
