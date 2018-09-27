'use strict'

/* global describe, it, spyOn expect beforeEach */
const moment = require('moment')
const checkWindowAddValidator = require('../../../../../lib/validator/check-window-v2/check-window-add-validator')

const checkWindowNameValidator = require('../../../../../lib/validator/check-window-v2/check-window-name-validator')
const checkWindowAdminStartDateValidator = require('../../../../../lib/validator/check-window-v2/check-window-admin-start-date-validator')
const checkWindowAdminEndDateValidator = require('../../../../../lib/validator/check-window-v2/check-window-admin-end-date-validator')
const checkWindowFamiliarisationCheckStartDateValidator = require('../../../../../lib/validator/check-window-v2/check-window-familiarisation-check-start-date-validator')
const checkWindowFamiliarisationCheckEndDateValidator = require('../../../../../lib/validator/check-window-v2/check-window-familiarisation-check-end-date-validator')
const checkWindowLiveCheckStartDateValidator = require('../../../../../lib/validator/check-window-v2/check-window-live-check-start-date-validator')
const checkWindowLiveCheckEndDateValidator = require('../../../../../lib/validator/check-window-v2/check-window-live-check-end-date-validator')

describe('New check window add validator', function () {
  let checkWindowData
  describe('validate', function () {
    beforeEach(() => {
      spyOn(checkWindowNameValidator, 'validate')
      spyOn(checkWindowAdminStartDateValidator, 'validate')
      spyOn(checkWindowAdminEndDateValidator, 'validate')
      spyOn(checkWindowFamiliarisationCheckStartDateValidator, 'validate')
      spyOn(checkWindowFamiliarisationCheckEndDateValidator, 'validate')
      spyOn(checkWindowLiveCheckStartDateValidator, 'validate')
      spyOn(checkWindowLiveCheckEndDateValidator, 'validate')
      checkWindowData = {
        adminStartDay: moment.utc().add(1, 'days').format('DD'),
        adminStartMonth: moment.utc().add(1, 'days').format('MM'),
        adminStartYear: moment.utc().add(1, 'days').format('YYYY'),
        adminEndDay: moment.utc().add(10, 'days').format('DD'),
        adminEndMonth: moment.utc().add(10, 'days').format('MM'),
        adminEndYear: moment.utc().add(10, 'days').format('YYYY'),
        familiarisationCheckStartDay: moment.utc().add(2, 'days').format('DD'),
        familiarisationCheckStartMonth: moment.utc().add(2, 'days').format('MM'),
        familiarisationCheckStartYear: moment.utc().add(2, 'days').format('YYYY'),
        familiarisationCheckEndDay: moment.utc().add(3, 'days').format('DD'),
        familiarisationCheckEndMonth: moment.utc().add(3, 'days').format('MM'),
        familiarisationCheckEndYear: moment.utc().add(3, 'days').format('YYYY'),
        liveCheckStartDay: moment.utc().add(4, 'days').format('DD'),
        liveCheckStartMonth: moment.utc().add(4, 'days').format('MM'),
        liveCheckStartYear: moment.utc().add(4, 'days').format('YYYY'),
        liveCheckEndDay: moment.utc().add(5, 'days').format('DD'),
        liveCheckEndMonth: moment.utc().add(5, 'days').format('MM'),
        liveCheckEndYear: moment.utc().add(5, 'days').format('YYYY')
      }
    })
    it('returns validationError object', () => {
      const validationError = checkWindowAddValidator.validate(checkWindowData)
      expect(checkWindowAdminEndDateValidator.validate).toHaveBeenCalled()
      expect(checkWindowAdminStartDateValidator.validate).toHaveBeenCalled()
      expect(checkWindowFamiliarisationCheckStartDateValidator.validate).toHaveBeenCalled()
      expect(checkWindowFamiliarisationCheckEndDateValidator.validate).toHaveBeenCalled()
      expect(checkWindowLiveCheckStartDateValidator.validate).toHaveBeenCalled()
      expect(checkWindowLiveCheckEndDateValidator.validate).toHaveBeenCalled()
      expect(validationError.hasError()).toBeFalsy()
    })
    it('calls addError with adminStartDateAfterFamiliarisationCheckStartDate if the admin start day is after familiarisation check start date', () => {
      checkWindowData.adminStartDay = moment.utc().add(3, 'days').format('DD')
      checkWindowData.adminStartMonth = moment.utc().add(3, 'days').format('MM')
      checkWindowData.adminStartYear = moment.utc().add(3, 'days').format('YYYY')
      const validationError = checkWindowAddValidator.validate(checkWindowData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.errors.adminStartDateAfterFamiliarisationCheckStartDate).toBeTruthy()
    })
    it('calls addError with adminStartDateAfterLiveCheckStartDate if the admin start day is after live check start date', () => {
      checkWindowData.adminStartDay = moment.utc().add(5, 'days').format('DD')
      checkWindowData.adminStartMonth = moment.utc().add(5, 'days').format('MM')
      checkWindowData.adminStartYear = moment.utc().add(5, 'days').format('YYYY')
      const validationError = checkWindowAddValidator.validate(checkWindowData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.errors.adminStartDateAfterLiveCheckStartDate).toBeTruthy()
    })
    it('calls addError with adminEndDateBeforeAdminStartDate if the admin end day is before admin start date', () => {
      checkWindowData.adminEndDay = moment.utc().format('DD')
      checkWindowData.adminEndMonth = moment.utc().format('MM')
      checkWindowData.adminEndYear = moment.utc().format('YYYY')
      const validationError = checkWindowAddValidator.validate(checkWindowData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.errors.adminEndDateBeforeAdminStartDate).toBeTruthy()
    })
    it('calls addError with adminEndDateBeforeLiveCheckEndDate if the admin end day is before live check end date', () => {
      checkWindowData.adminEndDay = moment.utc().format('DD')
      checkWindowData.adminEndMonth = moment.utc().format('MM')
      checkWindowData.adminEndYear = moment.utc().format('YYYY')
      const validationError = checkWindowAddValidator.validate(checkWindowData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.errors.adminEndDateBeforeLiveCheckEndDate).toBeTruthy()
    })
    it('calls addError with adminEndDateBeforeFamiliarisationCheckEndDate if the admin end day is before familiarisation check end date', () => {
      checkWindowData.adminEndDay = moment.utc().format('DD')
      checkWindowData.adminEndMonth = moment.utc().format('MM')
      checkWindowData.adminEndYear = moment.utc().format('YYYY')
      const validationError = checkWindowAddValidator.validate(checkWindowData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.errors.adminEndDateBeforeFamiliarisationCheckEndDate).toBeTruthy()
    })
    it('calls addError with familiarisationCheckStartDateAfterLiveCheckStartDate if the familiarisation check start day is after live check start date', () => {
      checkWindowData.familiarisationCheckStartDay = moment.utc().add(5, 'days').format('DD')
      checkWindowData.familiarisationCheckStartMonth = moment.utc().add(5, 'days').format('MM')
      checkWindowData.familiarisationCheckStartYear = moment.utc().add(5, 'days').format('YYYY')
      const validationError = checkWindowAddValidator.validate(checkWindowData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.errors.familiarisationCheckStartDateAfterLiveCheckStartDate).toBeTruthy()
    })
    it('calls addError with familiarisationCheckStartDateAfterFamiliarisationCheckEndDate if the familiarisation check start day is after familiarisation check end date', () => {
      checkWindowData.familiarisationCheckStartDay = moment.utc().add(5, 'days').format('DD')
      checkWindowData.familiarisationCheckStartMonth = moment.utc().add(5, 'days').format('MM')
      checkWindowData.familiarisationCheckStartYear = moment.utc().add(5, 'days').format('YYYY')
      const validationError = checkWindowAddValidator.validate(checkWindowData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.errors.familiarisationCheckStartDateAfterFamiliarisationCheckEndDate).toBeTruthy()
    })
    it('calls addError with familiarisationCheckEndDateBeforeAdminStartDate if the familiarisation check end day is before admin start date', () => {
      checkWindowData.familiarisationCheckEndDay = moment.utc().format('DD')
      checkWindowData.familiarisationCheckEndMonth = moment.utc().format('MM')
      checkWindowData.familiarisationCheckEndYear = moment.utc().format('YYYY')
      const validationError = checkWindowAddValidator.validate(checkWindowData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.errors.familiarisationCheckEndDateBeforeAdminStartDate).toBeTruthy()
    })
    it('calls addError with liveCheckStartDateAfterLiveCheckEndDate if the live check start day is after live check end date', () => {
      checkWindowData.liveCheckStartDay = moment.utc().add(6, 'days').format('DD')
      checkWindowData.liveCheckStartMonth = moment.utc().add(6, 'days').format('MM')
      checkWindowData.liveCheckStartYear = moment.utc().add(6, 'days').format('YYYY')
      const validationError = checkWindowAddValidator.validate(checkWindowData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.errors.liveCheckStartDateAfterLiveCheckEndDate).toBeTruthy()
    })
    it('calls addError with liveCheckEndDateBeforeAdminStartDate if the live check end day is before admin start date', () => {
      checkWindowData.liveCheckEndDay = moment.utc().format('DD')
      checkWindowData.liveCheckEndMonth = moment.utc().format('MM')
      checkWindowData.liveCheckEndYear = moment.utc().format('YYYY')
      const validationError = checkWindowAddValidator.validate(checkWindowData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.errors.liveCheckEndDateBeforeAdminStartDate).toBeTruthy()
    })
  })
})
