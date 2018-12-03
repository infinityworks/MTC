'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const rolesConfig = require('../roles-config')
const checkFormV2Controller = require('../controllers/check-form-v2')
const featureToggles = require('feature-toggles')

if (featureToggles.isFeatureEnabled('newCheckForm')) {
  /* Check Window routing */
  router.get('/upload-and-view-forms-v2', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => checkFormV2Controller.uploadAndViewFormsPage(req, res, next))
  router.get('/upload-new-form-v2', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => checkFormV2Controller.uploadCheckFormPage(req, res, next))
  router.post('/submit-check-form-v2', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => checkFormV2Controller.submitCheckForm(req, res, next))
}

module.exports = router
