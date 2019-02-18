const config = require('../config')

module.exports.generateSql = () => {
  return `GRANT DELETE ON [mtc_admin].[anomalyReportCache] TO ${config.Application.Username}`
}
