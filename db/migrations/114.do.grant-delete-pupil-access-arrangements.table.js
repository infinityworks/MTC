const config = require('../config')

module.exports.generateSql = () => {
  return `GRANT DELETE ON [mtc_admin].[pupilAccessArrangements] TO ${config.Application.Username}`
}
