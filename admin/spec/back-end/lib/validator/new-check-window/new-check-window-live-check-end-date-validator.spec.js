'use strict'

/* global describe, it, spyOn expect */

const moment = require('moment')
const checkWindowErrorMessages = require('../../../../../lib/errors/new-check-window')
const ValidationError = require('../../../../../lib/validation-error')
const newCheckWindowLiveCheckEndDateValidator = require('../../../../../lib/validator/new-check-window/new-check-window-live-check-end-date-validator')

describe('New check window live check end date validator', function () {
  describe('validate', function () {
    it('should not call addError method if the validation is successful', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const liveCheckEndDateData = {
        liveCheckEndDay: moment.utc().add(1, 'days').format('DD'),
        liveCheckEndMonth: moment.utc().add(1, 'days').format('MM'),
        liveCheckEndYear: moment.utc().add(1, 'days').format('YYYY')
      }
      newCheckWindowLiveCheckEndDateValidator.validate(validationError, liveCheckEndDateData)
      expect(validationError.addError).not.toHaveBeenCalled()
    })
    it('calls addError with liveCheckEndDayRequired message if the live check end day is missing', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const liveCheckEndDateData = {
        liveCheckEndDay: '',
        liveCheckEndMonth: moment.utc().add(1, 'days').format('MM'),
        liveCheckEndYear: moment.utc().add(1, 'days').format('YYYY')
      }
      newCheckWindowLiveCheckEndDateValidator.validate(validationError, liveCheckEndDateData)
      expect(validationError.addError).toHaveBeenCalledWith('liveCheckEndDay', checkWindowErrorMessages.liveCheckEndDayRequired)
    })
    it('calls addError with liveCheckEndDayWrongDay and liveCheckEndDayInvalidChars messages if the live check end day is invalid', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const liveCheckEndDateData = {
        liveCheckEndDay: 'on',
        liveCheckEndMonth: moment.utc().add(1, 'days').format('MM'),
        liveCheckEndYear: moment.utc().add(1, 'days').format('YYYY')
      }
      newCheckWindowLiveCheckEndDateValidator.validate(validationError, liveCheckEndDateData)
      expect(validationError.addError).toHaveBeenCalledWith('liveCheckEndDay', checkWindowErrorMessages.liveCheckEndDayWrongDay)
      expect(validationError.addError).toHaveBeenCalledWith('liveCheckEndDay', checkWindowErrorMessages.liveCheckEndDayInvalidChars)
    })
    it('calls addError with liveCheckEndMonthRequired, message if the live check end month is missing', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const liveCheckEndDateData = {
        liveCheckEndDay: moment.utc().add(1, 'days').format('DD'),
        liveCheckEndMonth: '',
        liveCheckEndYear: moment.utc().add(1, 'days').format('YYYY')
      }
      newCheckWindowLiveCheckEndDateValidator.validate(validationError, liveCheckEndDateData)
      expect(validationError.addError).toHaveBeenCalledWith('liveCheckEndMonth', checkWindowErrorMessages.liveCheckEndMonthRequired)
    })
    it('calls addError with liveCheckEndMonthWrongDay and liveCheckEndMonthInvalidChars messages if the live check end month is invalid', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const liveCheckEndDateData = {
        liveCheckEndDay: moment.utc().add(1, 'days').format('DD'),
        liveCheckEndMonth: 'tw',
        liveCheckEndYear: moment.utc().add(1, 'days').format('YYYY')
      }
      newCheckWindowLiveCheckEndDateValidator.validate(validationError, liveCheckEndDateData)
      expect(validationError.addError).toHaveBeenCalledWith('liveCheckEndMonth', checkWindowErrorMessages.liveCheckEndMonthWrongDay)
      expect(validationError.addError).toHaveBeenCalledWith('liveCheckEndMonth', checkWindowErrorMessages.liveCheckEndMonthInvalidChars)
    })
    it('calls addError with liveCheckEndYearRequired, message if the live check end year is missing', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const liveCheckEndDateData = {
        liveCheckEndDay: moment.utc().add(1, 'days').format('DD'),
        liveCheckEndMonth: moment.utc().add(1, 'days').format('MM'),
        liveCheckEndYear: ''
      }
      newCheckWindowLiveCheckEndDateValidator.validate(validationError, liveCheckEndDateData)
      expect(validationError.addError).toHaveBeenCalledWith('liveCheckEndYear', checkWindowErrorMessages.liveCheckEndYearRequired)
    })
    it('calls addError with liveCheckEndYearWrongDay and liveCheckEndYearInvalidChars messages if the live check end year is invalid', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const liveCheckEndDateData = {
        liveCheckEndDay: moment.utc().add(1, 'days').format('DD'),
        liveCheckEndMonth: moment.utc().add(1, 'days').format('MM'),
        liveCheckEndYear: 'th'
      }
      newCheckWindowLiveCheckEndDateValidator.validate(validationError, liveCheckEndDateData)
      expect(validationError.addError).toHaveBeenCalledWith('liveCheckEndYear', checkWindowErrorMessages.liveCheckEndYearWrongDay)
      expect(validationError.addError).toHaveBeenCalledWith('liveCheckEndYear', checkWindowErrorMessages.liveCheckEndYearInvalidChars)
    })
    it('calls addError with liveCheckEndYearWrongDay and liveCheckEndYearInvalidChars messages if the live check end year is invalid', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const liveCheckEndDateData = {
        liveCheckEndDay: moment.utc().add(1, 'days').format('DD'),
        liveCheckEndMonth: moment.utc().add(1, 'days').format('MM'),
        liveCheckEndYear: moment.utc().add(1, 'days').format('YY')
      }
      newCheckWindowLiveCheckEndDateValidator.validate(validationError, liveCheckEndDateData)
      expect(validationError.addError).toHaveBeenCalledWith('liveCheckEndYear', checkWindowErrorMessages.liveCheckEndYearWrongDay)
      expect(validationError.addError).toHaveBeenCalledWith('liveCheckEndYear', checkWindowErrorMessages.liveCheckEndYearInvalidChars)
    })
    it('calls addError with liveCheckEndYearWrongDay message if the live check end year is in the past', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const liveCheckEndDateData = {
        liveCheckEndDay: moment.utc().add(1, 'days').format('DD'),
        liveCheckEndMonth: moment.utc().add(1, 'days').format('MM'),
        liveCheckEndYear: moment.utc().subtract(1, 'year').format('YYYY')
      }
      newCheckWindowLiveCheckEndDateValidator.validate(validationError, liveCheckEndDateData)
      expect(validationError.addError).toHaveBeenCalledWith('liveCheckEndYear', checkWindowErrorMessages.liveCheckEndYearWrongDay)
    })
    it('calls addError with liveCheckEndDateInThePast message if the live check end date is in the past', () => {
      const validationError = new ValidationError()
      const addErrorSpy = spyOn(validationError, 'addError')
      const liveCheckEndDateData = {
        liveCheckEndDay: moment.utc().add(1, 'days').format('DD'),
        liveCheckEndMonth: moment.utc().add(1, 'days').format('MM'),
        liveCheckEndYear: moment.utc().subtract(1, 'year').format('YYYY')
      }
      newCheckWindowLiveCheckEndDateValidator.validate(validationError, liveCheckEndDateData)
      expect(addErrorSpy.calls.argsFor(1)).toEqual([ 'liveCheckEndDateInThePast', true ])
    })
  })
})