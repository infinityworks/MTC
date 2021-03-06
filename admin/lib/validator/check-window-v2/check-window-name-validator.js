'use strict'
const { isEmpty } = require('validator')

const checkWindowErrorMessages = require('../../errors/check-window-v2')

const checkWindowNameValidator = {}

/**
 * Validates check window data for first submission
 * @param {Object} validationError
 * @param {String} checkWindowName
 */
checkWindowNameValidator.validate = (validationError, checkWindowName) => {
  const CheckWindowNameValue = checkWindowName.trim()
  if (isEmpty(CheckWindowNameValue) || CheckWindowNameValue.length < 1 || CheckWindowNameValue.length > 35) {
    validationError.addError('checkWindowName', checkWindowErrorMessages.checkWindowNameLength)
  }
}

module.exports = checkWindowNameValidator
