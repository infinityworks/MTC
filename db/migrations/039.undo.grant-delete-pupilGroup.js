const config = require('../config')

module.exports.generateSql = () => {
  return `REVOKE DELETE ON [mtc_admin].[pupilGroup] FROM ${config.Application.Username}`
}
