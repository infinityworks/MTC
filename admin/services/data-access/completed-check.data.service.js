'use strict'

const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES
const R = require('ramda')

const completedCheckDataService = {}
const checkDataService = require('./check.data.service')

/**
 * @description inserts a new check to the database
 * @param {object} data JSON object to insert
 */
completedCheckDataService.sqlCreate = async function (data) {
  return sqlService.create('[check]', data)
}

/**
 * Updates check record with results
 * @param checkCode
 * @param completedCheck the entire JSON payload submitted by the pupil
 * @param receivedByServerAt the timestamp when data was received by the server
 * @return {Promise}
 */
completedCheckDataService.sqlAddResult = async function (checkCode, completedCheck, receivedByServerAt) {
  const params = [
    {
      name: 'checkCode',
      value: checkCode,
      type: TYPES.UniqueIdentifier
    }
  ]
  // TODO: Refactor to extract two DL methods from this to make it simpler
  // TODO: The error should be thrown from a service method instead
  const sql = `SELECT id FROM ${sqlService.adminSchema}.[check] WHERE checkCode=@checkCode`
  let result = await sqlService.query(sql, params)
  result = R.head(result)
  if (!result || !result.id) {
    throw new Error(`Could not find check with checkCode:${checkCode}`)
  }
  const checkId = result.id
  const checkDataParams = {
    'id': checkId,
    'data': JSON.stringify(completedCheck),
    'receivedByServerAt': receivedByServerAt
  }
  return sqlService.update('[check]', checkDataParams)
}

/**
 * @param {string} checkCode
 * @deprecated - Use checkDataService.sqlFindOneByCheckCode instead
 */
completedCheckDataService.sqlFindOne = async (checkCode) => {
  const result = await checkDataService.sqlFindOneByCheckCode(checkCode)
  return R.head(result)
}

/**
 *
 * @param {Array<object>} batchIds array of integers
 * @return {Promise<Array>}
 */
completedCheckDataService.sqlFindByIds = async (batchIds) => {
  let select = `
  SELECT 
  chk.*,
  cr.payload,
  cs.code,
  cs.description,
  prr.code restartCode,
  (
    SELECT COUNT(id)
    FROM [mtc_admin].[pupilRestart] pr
    WHERE pr.pupil_id = chk.pupil_id
    AND pr.createdAt < chk.createdAt
    AND pr.isDeleted = 0
  ) restartCount,
  ac.code attendanceCode
  FROM [mtc_admin].[check] chk
      LEFT JOIN [mtc_admin].[checkResult] cr ON (chk.id = cr.check_id)
      LEFT JOIN [mtc_admin].[pupilRestart] pr ON (pr.check_id = chk.id AND pr.isDeleted = 0)
      LEFT JOIN [mtc_admin].[pupilRestartReason] prr ON (prr.id = pr.pupilRestartReason_id)
      LEFT JOIN [mtc_admin].[pupilAttendance] pa ON (pa.pupil_id = chk.pupil_id AND pa.isDeleted = 0)
      LEFT JOIN [mtc_admin].[attendanceCode] ac ON (ac.id = pa.attendanceCode_id)
      JOIN [mtc_admin].[checkStatus] cs ON (chk.checkStatus_id = cs.id)
  `
  const where = sqlService.buildParameterList(batchIds, TYPES.Int)
  const sql = [select, 'WHERE chk.id IN (', where.paramIdentifiers.join(', '), ')'].join(' ')
  // Populate the JSON data structure which is stored as a string in the SQL DB
  const results = await sqlService.query(sql, where.params)
  const parsed = results.map(x => {
    if (!x.payload) {
      return R.clone(x)
    }
    const parsedPayload = JSON.parse(x.payload)
    return R.assoc('data', parsedPayload, R.omit(['payload'], x))
  })
  return parsed
}

/**
 * Returns the joined selection of check and check forms with check.data parsed
 * @param {Array<object>} batchIds array of integers
 * @return {Promise<Array>}
 */
completedCheckDataService.sqlFindByIdsWithForms = async (batchIds) => {
  let select = `
  SELECT 
         chk.*, 
         f.formData,
         cr.payload
  FROM ${sqlService.adminSchema}.[check] chk JOIN
    ${sqlService.adminSchema}.[checkResult] cr on (chk.id = cr.check_id) JOIN 
    ${sqlService.adminSchema}.[checkForm] f ON chk.checkForm_id = f.id
  `
  const where = sqlService.buildParameterList(batchIds, TYPES.Int)
  const sql = [select, 'WHERE chk.id IN (', where.paramIdentifiers.join(', '), ')'].join(' ')
  // Populate the JSON data structure which is stored as a string in the SQL DB
  const results = await sqlService.query(sql, where.params)
  const parsed = results.map(x => {
    if (!x.payload) {
      return R.clone(x)
    }
    const transformations = {
      formData: JSON.parse,
      payload: JSON.parse
    }
    const d1 = R.evolve(transformations, x)
    return R.assoc('data', d1.payload, R.omit(['payload'], d1))
  })
  return parsed
}

/**
 * @description returns a boolean indicating whether there are unmarked checks in the database
 */
completedCheckDataService.sqlHasUnmarked = async () => {
  const sql = `SELECT COUNT(*) as [unmarkedCount]
  FROM [mtc_admin].[check] chk JOIN
     [mtc_admin].[checkStatus] cs ON (chk.checkStatus_id = cs.id) LEFT JOIN
     [mtc_admin].[checkResult] cr ON (chk.id = cr.check_id)
  WHERE cs.code = 'CMP'
  AND chk.markedAt IS NULL
  AND cr.[payload] IS NOT NULL`
  const result = await sqlService.query(sql)
  return result[0].unmarkedCount > 0
}

/**
 * Returns an array of Ids: [1234, 5678, ...] of CompletedChecks.  Used by the batch processor.
 * @param batchSize the size of the batch to work with
 * @return {Promise.<Array>}
 */
completedCheckDataService.sqlFindUnmarked = async function (batchSize) {
  if (!batchSize) {
    throw new Error('Missing argument: batchSize')
  }
  const safeBatchSize = parseInt(batchSize, 10)

  const sql = `SELECT TOP ${safeBatchSize} chk.id 
    FROM [mtc_admin].[check] chk JOIN
     [mtc_admin].[checkStatus] cs ON (chk.checkStatus_id = cs.id) LEFT JOIN
     [mtc_admin].[checkResult] cr ON (chk.id = cr.check_id)
  WHERE cs.code = 'CMP'
    AND chk.markedAt IS NULL
    AND cr.[payload] IS NOT NULL`
  const results = await sqlService.query(sql)
  return results.map(r => r.id)
}

// used by PS Report to set all unmarked

completedCheckDataService.sqlSetAllUnmarked = async () => {
  const sql = `UPDATE [mtc_admin].[check] SET markedAt=NULL`
  return sqlService.modify(sql)
}

/**
 * Return a single check with the SPA data as an object
 * @param checkCode
 * @return {Promise<void>}
 */
completedCheckDataService.sqlFindOneByCheckCode = async function (checkCode) {
  const params = [
    {
      name: 'checkCode',
      value: checkCode,
      type: TYPES.UniqueIdentifier
    }
  ]
  const result = await sqlService.query(`SELECT * FROM ${sqlService.adminSchema}.[check] WHERE checkCode=@checkCode`, params)

  // Hydrate the JSON string in to an object
  const first = R.head(result)
  return R.assoc('data', (JSON.parse(first.data)).data, first)
}

/**
 * Retrieve a number of completed checks especially for use in a batch service
 * @param lowCheckId
 * @param batchSize
 * @return {Promise}
 */
completedCheckDataService.sqlFind = async (lowCheckId, batchSize) => {
  const safeBatchSize = parseInt(batchSize, 10)
  if (isNaN(safeBatchSize)) {
    throw new Error(`batchSize is not a number: ${batchSize}`)
  }
  if (safeBatchSize < 1) {
    throw new Error('Batch size must be at least 1')
  }
  if (safeBatchSize > 250) {
    // As the SQL has an ORDER BY clause we need to limit the number of rows ordered
    // for performance reasons.
    throw new Error(`batchSize too large`)
  }
  const sql = `
    SELECT 
      TOP ${safeBatchSize} *
    FROM ${sqlService.adminSchema}.[check]
    WHERE data IS NOT NULL
    AND id >= @lowCheckId
    ORDER BY ID ASC
  `
  const params = [
    {
      name: 'lowCheckId',
      value: lowCheckId,
      type: TYPES.Int
    }
  ]
  const checks = await sqlService.query(sql, params)
  return R.map(parseData, checks)
}

/**
 * Return some meta information about the completed checks so a batch service can operate on it
 * @return {Promise}
 */
completedCheckDataService.sqlFindMeta = async () => {
  const sql = `
    SELECT
    min(id) as [min], max(id) as [max], count(id) as [count]
    FROM [mtc_admin].[check]
    WHERE data IS NOT NULL;
  `
  const res = await sqlService.query(sql)
  return R.head(res)
}

function parseData (check) {
  if (!check.data) {
    return check
  }

  try {
    const decoded = JSON.parse(check.data)
    check.data = decoded.data
  } catch (error) {
    console.error(`Error: failed to decode JSON for check [${check.id}]: ${error.message}`)
  }

  return check
}

module.exports = completedCheckDataService
