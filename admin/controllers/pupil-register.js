'use strict'

const pupilIdentificationFlag = require('../services/pupil-identification-flag.service')
const pupilRegisterService = require('../services/pupil-register.service')
const headteacherDeclarationService = require('../services/headteacher-declaration.service')
const featureToggles = require('feature-toggles')

const listPupils = async (req, res, next) => {
  res.locals.pageTitle = 'Pupil register'
  const sortField = req.params.sortField === undefined ? 'name' : req.params.sortField
  const sortDirection = req.params.sortDirection === undefined ? 'asc' : req.params.sortDirection

  let pupilsFormatted = []

  try {
    if (featureToggles.isFeatureEnabled('prepareCheckMessaging')) {
      pupilsFormatted = await pupilRegisterService.getPupilRegister(req.user.schoolId, sortDirection)
    } else {
      pupilsFormatted = await pupilRegisterService.getPupils(req.user.School, req.user.schoolId, sortDirection)
      pupilIdentificationFlag.addIdentificationFlags(pupilsFormatted)
      pupilRegisterService.sortPupils(pupilsFormatted, sortField, sortDirection)
    }
  } catch (error) {
    next(error)
  }

  req.breadcrumbs(res.locals.pageTitle)
  let { hl } = req.query
  if (hl) {
    hl = JSON.parse(hl)
    hl = typeof hl === 'string' ? JSON.parse(hl) : hl
  }

  let hdfSubmitted
  try {
    hdfSubmitted = await headteacherDeclarationService.isHdfSubmittedForCurrentCheck(req.user.School)
  } catch (error) {
    return next(error)
  }

  res.render('pupil-register/pupils-list', {
    highlight: hl && new Set(hl),
    pupils: pupilsFormatted,
    hdfSubmitted: hdfSubmitted,
    breadcrumbs: req.breadcrumbs()
  })
}

module.exports = { listPupils }
