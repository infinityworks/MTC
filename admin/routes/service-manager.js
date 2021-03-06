'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const rolesConfig = require('../roles-config')
const serviceManagerController = require('../controllers/service-manager')

/* Service Manager routing */
router.get('/home', isAuthenticated(rolesConfig.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.getServiceManagerHome(req, res, next))
router.get('/check-windows', isAuthenticated(rolesConfig.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.getCheckWindows(req, res, next))
router.get('/check-windows/remove/:checkWindowId', isAuthenticated(rolesConfig.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.removeCheckWindow(req, res, next))
router.get('/check-windows/add', isAuthenticated(rolesConfig.ROLE_SERVICE_MANAGER), (req, res) => serviceManagerController.getCheckWindowForm(req, res))
router.get('/check-windows/edit/:id', isAuthenticated(rolesConfig.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.getCheckWindowEditForm(req, res, next))
router.get('/check-windows/:sortField/:sortDirection', isAuthenticated(rolesConfig.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.getCheckWindows(req, res, next))
router.get('/check-windows/:sortField/:sortDirection/:error', isAuthenticated(rolesConfig.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.getCheckWindows(req, res, next))
router.post('/check-windows/save', isAuthenticated(rolesConfig.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.saveCheckWindow(req, res, next))
router.post('/check-windows/submit', isAuthenticated(rolesConfig.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.submitCheckWindow(req, res, next))
router.get('/check-settings', isAuthenticated(rolesConfig.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.getUpdateTiming(req, res, next))
router.get('/check-settings/:status', isAuthenticated(rolesConfig.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.getUpdateTiming(req, res, next))
router.post('/check-settings', isAuthenticated(rolesConfig.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.setUpdateTiming(req, res, next))
router.get('/upload-pupil-census', isAuthenticated(rolesConfig.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.getUploadPupilCensus(req, res, next))
router.post('/upload-pupil-census/upload', isAuthenticated(rolesConfig.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.postUploadPupilCensus(req, res, next))
router.get('/upload-pupil-census/delete/:pupilCensusId', isAuthenticated(rolesConfig.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.getRemovePupilCensus(req, res, next))

module.exports = router
