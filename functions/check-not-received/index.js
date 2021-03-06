'use strict'

const { performance } = require('perf_hooks')

const v1 = require('./v1')

module.exports = async function (context, timer) {
  const start = performance.now()
  let meta
  try {
    meta = await v1.process(context.log)
  } catch (error) {
    context.log.error(`check-not-received: ERROR: ${error.message}`)
    throw error
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`check-not-received: ${timeStamp} run complete: expired ${meta.checksUpdated} check(s) in ${durationInMilliseconds} ms`)
}
