'use strict'
/* global describe beforeEach expect it fail spyOn */

const checkWindowDataService = require('../../../services/data-access/check-window.data.service')
const checkWindowAddValidator = require('../../../lib/validator/check-window-v2/check-window-add-validator')
const checkWindowV2AddService = require('../../../services/check-window-v2-add.service')
const checkWindowHelper = require('../../../helpers/check-window')
const ValidationError = require('../../../lib/validation-error')

describe('check-window-v2-add.service', () => {
  describe('submit', () => {
    describe('when validation is successful', () => {
      beforeEach(() => {
        const validationError = new ValidationError()
        spyOn(checkWindowAddValidator, 'validate').and.returnValue(validationError)
        spyOn(checkWindowHelper, 'prepareSubmissionData').and.returnValue({ name: 'Check window' })
        spyOn(checkWindowDataService, 'sqlCreate')
      })
      it('should process data, perform db insertion and return a flash message', async () => {
        const requestData = {}
        let flashMessage
        try {
          flashMessage = await checkWindowV2AddService.submit(requestData)
        } catch (error) {
          fail()
        }
        expect(checkWindowAddValidator.validate).toHaveBeenCalled()
        expect(checkWindowHelper.prepareSubmissionData).toHaveBeenCalled()
        expect(checkWindowDataService.sqlCreate).toHaveBeenCalled()
        expect(flashMessage).toBe('Check window has been created')
      })
    })
    describe('when validation is unsuccessful', () => {
      beforeEach(() => {
        const validationError = new ValidationError()
        validationError.addError('errorField', true)
        spyOn(checkWindowAddValidator, 'validate').and.returnValue(validationError)
        spyOn(checkWindowHelper, 'prepareSubmissionData')
        spyOn(checkWindowDataService, 'sqlCreate')
      })
      it('should throw the validation error back to the caller', async () => {
        const requestData = {}
        try {
          await checkWindowV2AddService.submit(requestData)
          fail()
        } catch (error) {
          expect(error.name).toBe('ValidationError')
          expect(Object.keys(error.errors).length).toBe(1)
        }
        expect(checkWindowAddValidator.validate).toHaveBeenCalled()
        expect(checkWindowHelper.prepareSubmissionData).not.toHaveBeenCalled()
        expect(checkWindowDataService.sqlCreate).not.toHaveBeenCalled()
      })
    })
  })
})
