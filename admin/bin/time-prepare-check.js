#!/usr/bin/env node
'use strict'

require('dotenv').config()
const { PerformanceObserver, performance } = require('perf_hooks');
const winston = require('winston')
winston.level = 'info'

const poolService = require('../services/data-access/sql.pool.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const schoolDataService = require('../services/data-access/school.data.service')
const checkStartService = require('../services/check-start.service')
const featureToggles = require('feature-toggles')

featureToggles.load(require('../config/feature-toggles.default'))

async function main () {
  try {
    const dfeNumber = '9999955'
    const school = await schoolDataService.sqlFindOneByDfeNumber(dfeNumber)

    // fetch all the pupils belong to the test school
    const pupils = await pupilDataService.sqlFindPupilsByDfeNumber(dfeNumber)
    let count = 1
    console.log("Got " + pupils.length + " pupils")

    // Using prepareCheck2
    for (let pupil of pupils) {
      const t0 = performance.now()
      await checkStartService.prepareCheck(
        [pupil.id],
        dfeNumber,
        school.id,
        true)
      const t1 = performance.now()
      console.log(`pupil ${count++}, ${(t1 - t0)} ms`)
    }
  } catch (error) {
    winston.error(error)
  }
}

main()
  .then(() => {
    poolService.drain()
  })
  .catch(e => {
    console.warn(e)
    poolService.drain()
  })
