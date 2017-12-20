'use strict'
const moment = require('moment')
const checkDataService = require('../../services/data-access/check.data.service')
const pupilRestartDataService = require('../../services/data-access/pupil-restart.data.service')
const pupilDataService = require('../../services/data-access/pupil.data.service')
const completedCheckDataService = require('../../services/data-access/completed-check.data.service')
const pupilStatusService = require('../../services/pupil.status.service')
const pinValidator = require('../../lib/validator/pin-validator')
const pupilStatusCodesMock = require('../mocks/pupil-status-codes')
const checkMock = require('../mocks/check')
const pupilMock = require('../mocks/pupil')
const checkStartedMock = require('../mocks/check-started')
const pupilRestartMock = require('../mocks/pupil-restart')
const completedCheckMock = require('../mocks/completed-check')

/* global describe, it, expect, spyOn */
describe('pupil service', () => {
  describe('getStatus', () => {
    it('returns not taking the Check if the pupil has got an attendance code', async () => {
      const pupil = Object.assign({}, pupilMock)
      pupil.attendanceCode = {
        _id: 'id',
        dateRecorded: moment.utc(),
        byUserName: 'test',
        byUserEmail: 'test@email.com'
      }
      spyOn(pupilDataService, 'getStatusCodes').and.returnValue(pupilStatusCodesMock)
      const result = await pupilStatusService.getStatus(pupil)
      expect(result).toBe('Not taking the Check')
    })
    it('returns restart if pupil has an active restart and total started checks are equal to restarts', async () => {
      const pupil = Object.assign({}, pupilMock)
      spyOn(pupilDataService, 'getStatusCodes').and.returnValue(pupilStatusCodesMock)
      spyOn(checkDataService, 'count').and.returnValue(1)
      spyOn(pupilRestartDataService, 'findLatest').and.returnValue(pupilRestartMock)
      spyOn(pupilRestartDataService, 'count').and.returnValue(1)
      spyOn(pinValidator, 'isActivePin').and.returnValue(false)
      const result = await pupilStatusService.getStatus(pupil)
      expect(result).toBe('Restart')
    })
    it('returns not started when pupil does not have an active pin and no check record', async () => {
      const pupil = Object.assign({}, pupilMock)
      spyOn(pupilDataService, 'getStatusCodes').and.returnValue(pupilStatusCodesMock)
      spyOn(checkDataService, 'count').and.returnValue(0)
      spyOn(pupilRestartDataService, 'findLatest').and.returnValue(null)
      spyOn(pupilRestartDataService, 'count').and.returnValue(0)
      spyOn(pinValidator, 'isActivePin').and.returnValue(false)
      spyOn(checkDataService, 'findLatestCheck').and.returnValue(null)
      const result = await pupilStatusService.getStatus(pupil)
      expect(result).toBe('Not started')
    })
    it('returns pin generated when pupil has an active pin and no check record', async () => {
      const pupil = Object.assign({}, pupilMock)
      spyOn(pupilDataService, 'getStatusCodes').and.returnValue(pupilStatusCodesMock)
      spyOn(checkDataService, 'count').and.returnValue(0)
      spyOn(pupilRestartDataService, 'findLatest').and.returnValue(null)
      spyOn(pupilRestartDataService, 'count').and.returnValue(0)
      spyOn(pinValidator, 'isActivePin').and.returnValue(true)
      spyOn(checkDataService, 'findLatestCheck').and.returnValue(null)
      const result = await pupilStatusService.getStatus(pupil)
      expect(result).toBe('PIN generated')
    })
    it('returns in progress when pupil has active pin but a check record with no check started timestamp', async () => {
      const pupil = Object.assign({}, pupilMock)
      spyOn(pupilDataService, 'getStatusCodes').and.returnValue(pupilStatusCodesMock)
      spyOn(checkDataService, 'count').and.returnValue(0)
      spyOn(pupilRestartDataService, 'findLatest').and.returnValue(null)
      spyOn(pupilRestartDataService, 'count').and.returnValue(0)
      spyOn(pinValidator, 'isActivePin').and.returnValue(true)
      spyOn(checkDataService, 'findLatestCheck').and.returnValue(checkMock)
      const result = await pupilStatusService.getStatus(pupil)
      expect(result).toBe('In Progress')
    })
    it('returns check started when pupil does not have an active pin and a completed check record but a started check', async () => {
      const pupil = Object.assign({}, pupilMock)
      spyOn(pupilDataService, 'getStatusCodes').and.returnValue(pupilStatusCodesMock)
      spyOn(checkDataService, 'count').and.returnValue(1)
      spyOn(pupilRestartDataService, 'findLatest').and.returnValue(null)
      spyOn(pupilRestartDataService, 'count').and.returnValue(0)
      spyOn(completedCheckDataService, 'find').and.returnValue([])
      spyOn(pinValidator, 'isActivePin').and.returnValue(false)
      spyOn(checkDataService, 'findLatestCheck').and.returnValue(checkStartedMock)
      const result = await pupilStatusService.getStatus(pupil)
      expect(result).toBe('Check started')
    })
    it('returns completed when a completed check that corresponds to the check code is found', async () => {
      const pupil = Object.assign({}, pupilMock)
      spyOn(pupilDataService, 'getStatusCodes').and.returnValue(pupilStatusCodesMock)
      spyOn(checkDataService, 'count').and.returnValue(1)
      spyOn(pupilRestartDataService, 'findLatest').and.returnValue(null)
      spyOn(pupilRestartDataService, 'count').and.returnValue()
      spyOn(completedCheckDataService, 'find').and.returnValue([ completedCheckMock ])
      spyOn(pinValidator, 'isActivePin').and.returnValue(false)
      spyOn(checkDataService, 'findLatestCheck').and.returnValue(checkStartedMock)
      const result = await pupilStatusService.getStatus(pupil)
      expect(result).toBe('Completed')
    })
    it('returns pin generated when new pin is generated after a restart', async () => {
      const pupil = Object.assign({}, pupilMock)
      spyOn(pupilDataService, 'getStatusCodes').and.returnValue(pupilStatusCodesMock)
      spyOn(checkDataService, 'count').and.returnValue(1)
      spyOn(pupilRestartDataService, 'findLatest').and.returnValue(pupilRestartMock)
      spyOn(pupilRestartDataService, 'count').and.returnValue(1)
      spyOn(completedCheckDataService, 'find').and.returnValue([ completedCheckMock ])
      spyOn(pinValidator, 'isActivePin').and.returnValue(true)
      spyOn(checkDataService, 'findLatestCheck').and.returnValue(checkMock)
      const result = await pupilStatusService.getStatus(pupil)
      expect(result).toBe('PIN generated')
    })
    it('returns in progress when pupil logs-in after a restart', async () => {
      const pupil = Object.assign({}, pupilMock)
      spyOn(pupilDataService, 'getStatusCodes').and.returnValue(pupilStatusCodesMock)
      spyOn(checkDataService, 'count').and.returnValue(1)
      spyOn(pupilRestartDataService, 'findLatest').and.returnValue(pupilRestartMock)
      spyOn(pupilRestartDataService, 'count').and.returnValue(1)
      spyOn(completedCheckDataService, 'find').and.returnValue([ completedCheckMock ])
      spyOn(pinValidator, 'isActivePin').and.returnValue(true)
      const newCheckMock = Object.assign({}, checkMock)
      newCheckMock.pupilLoginDate = moment.utc()
      spyOn(checkDataService, 'findLatestCheck').and.returnValue(newCheckMock)
      const result = await pupilStatusService.getStatus(pupil)
      expect(result).toBe('In Progress')
    })
    it('returns check started when pupil starts the check after a restart', async () => {
      const pupil = Object.assign({}, pupilMock)
      spyOn(pupilDataService, 'getStatusCodes').and.returnValue(pupilStatusCodesMock)
      spyOn(checkDataService, 'count').and.returnValue(2)
      spyOn(pupilRestartDataService, 'findLatest').and.returnValue(pupilRestartMock)
      spyOn(pupilRestartDataService, 'count').and.returnValue(1)
      spyOn(completedCheckDataService, 'find').and.returnValue([])
      spyOn(pinValidator, 'isActivePin').and.returnValue(false)
      const newCheckMock = Object.assign({}, checkStartedMock)
      newCheckMock.pupilLoginDate = moment.utc()
      spyOn(checkDataService, 'findLatestCheck').and.returnValue(newCheckMock)
      const result = await pupilStatusService.getStatus(pupil)
      expect(result).toBe('Check started')
    })
    it('returns completed when pupil completes the check after a restart', async () => {
      const pupil = Object.assign({}, pupilMock)
      spyOn(pupilDataService, 'getStatusCodes').and.returnValue(pupilStatusCodesMock)
      spyOn(checkDataService, 'count').and.returnValue(2)
      spyOn(pupilRestartDataService, 'findLatest').and.returnValue(pupilRestartMock)
      spyOn(pupilRestartDataService, 'count').and.returnValue(1)
      spyOn(completedCheckDataService, 'find').and.returnValue([ completedCheckMock ])
      spyOn(pinValidator, 'isActivePin').and.returnValue(false)
      const newCheckMock = Object.assign({}, checkStartedMock)
      newCheckMock.pupilLoginDate = moment.utc()
      spyOn(checkDataService, 'findLatestCheck').and.returnValue(newCheckMock)
      const result = await pupilStatusService.getStatus(pupil)
      expect(result).toBe('Completed')
    })
  })
})
