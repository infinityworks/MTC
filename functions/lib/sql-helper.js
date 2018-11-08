'use strict'

const R = require('ramda')
const sqlService = require('less-tedious')

const checkTable = '[check]'
const { TYPES } = require('tedious')
const schema = '[mtc_admin]'

const serviceToExport = {
  /**
   * Retrieve the checkFormAllocation data from the db
   * @param checkCode
   * @return {Promise<object>}
   */
  sqlFindCheckByCheckCode: async function (checkCode) {
    const sql = `SELECT TOP 1 * FROM ${schema}.${checkTable} WHERE checkCode = @checkCode`
    const params = [
      {
        name: 'checkCode',
        value: checkCode,
        type: TYPES.UniqueIdentifier
      }
    ]
    const res = await sqlService.query(sql, params)
    return R.head(res)
  },

  /**
   * Find any active familiarisation checks for a pupil
   * @param pupilId
   * @return {Promise<*>}
   */
  sqlFindFamiliarisationChecksForPupil: async function (pupilId) {
    const sql = `SELECT 
                  chk.* 
                FROM    ${schema}.${checkTable} chk JOIN
                        ${schema}.[checkStatus] chkStatus ON (chk.checkStatus_id = chkStatus.id)
                WHERE   chk.pupil_id = @pupilId
                AND     isLiveCheck = 0
                AND     chkStatus.code IN ('NEW', 'STARTED')`

    const params = [
      { name: 'pupilId', value: pupilId, type: TYPES.Int }
    ]

    return sqlService.query(sql, params)
  },

  /**
   * Set check status to complete
   *
   */
  sqlSetCheckStatusToComplete: async function (checkId) {
    const sql = `UPDATE ${sqlService.adminSchema}.[check] 
                 SET checkStatus_id = 
                    (SELECT TOP 1 FROM ${sqlService.adminSchema}.[checkStatus] WHERE code = 'CMP')
                 WHERE id = @checkId`

    const params = [
      { name: 'checkId', value: checkId, type: TYPES.Int }
    ]

    return sqlService.modify(sql, params)
  }

}

module.exports = serviceToExport
