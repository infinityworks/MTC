'use strict'

const sqlService = require('less-tedious')

const checkTable = '[check]'
const pupilAccessArrangementsTable = '[pupilAccessArrangements]'
const pupilTable = '[pupil]'
const { TYPES } = require('tedious')
const schema = '[mtc_admin]'
const config = require('../config')
sqlService.initialise(config)

const sqlUtil = {}
const accessArrangementCodes = {}

/**
 * Constants to describe the access arrangements codes
 */
sqlUtil.AACODES = Object.freeze({
  AUDIBLE_SOUNDS: 'ATA',
  COLOUR_CONTRAST: 'CCT',
  FONT_SIZE: 'FTS',
  INPUT_ASSISTANCE: 'ITA',
  NEXT_BETWEEN_QUESTIONS: 'NBQ',
  QUESTION_READER: 'QNR',
  NUMPAD_REMOVAL: 'RON'
})

sqlUtil.sqlFindPupilAccessArrangementsByCheckCode = async function (checkCode) {
  const sql = `
  SELECT pAA.*, pfs.code AS pupilFontSizeCode, pcc.code AS pupilColourContrastCode
  FROM ${schema}.${pupilAccessArrangementsTable} pAA
  LEFT OUTER JOIN ${sqlService.adminSchema}.[pupilFontSizes] pfs
    ON pAA.pupilFontSizes_id = pfs.id
  LEFT OUTER JOIN ${sqlService.adminSchema}.[pupilColourContrasts] pcc
    ON pAA.pupilColourContrasts_id = pcc.id
  INNER JOIN ${schema}.${pupilTable} p
    ON pAA.pupil_id = p.id
  INNER JOIN ${schema}.${checkTable} chk
    ON p.id = chk.pupil_id
  WHERE chk.checkCode = @checkCode`
  const params = [
    {
      name: 'checkCode',
      value: checkCode,
      type: TYPES.UniqueIdentifier
    }
  ]
  const result = await sqlService.query(sql, params)
  return result
}

/**
 * Find access arrangement codes by ids
 * @param {Array} ids
 * @returns {Array}
 */
sqlUtil.sqlFindAccessArrangementsCodesWithIds = async function (ids) {
  if (Object.keys(accessArrangementCodes).length === 0) {
    // init
    await init()
  }
  return Object.keys(accessArrangementCodes).filter(code =>
    accessArrangementCodes[code] && ids.includes(accessArrangementCodes[code].id)
  )
}

/**
 * Initialise method to populate accessArrangementCodes for caching purposes
 * @returns {Array}
 */
const init = async () => {
  let accessArrangements
  const sql = `
    SELECT *
    FROM ${schema}.[accessArrangements]`

  accessArrangements = await sqlService.query(sql)
  accessArrangements.map(aa => {
    accessArrangementCodes[aa.code] = { id: aa.id, code: aa.code }
  })
}

module.exports = sqlUtil
