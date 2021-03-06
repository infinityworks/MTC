const jwtService = require('../services/jwt.service')
const pinService = require('../services/pin.service')
const apiResponse = require('./api-response')

const checkStateService = require('../services/check-state.service')

/**
 * Expires the pupil's pin
 * @param req
 * @param res
 * @returns { object }
 */

const checkStarted = async (req, res) => {
  const { checkCode, accessToken } = req.body
  if (!checkCode) return apiResponse.badRequest(res)
  // User verification
  try {
    await jwtService.verify(accessToken)
  } catch (error) {
    return apiResponse.unauthorised(res)
  }

  try {
    await pinService.expirePupilPin(accessToken, checkCode)
    await checkStateService.changeState(checkCode, checkStateService.States.Started)
  } catch (error) {
    return apiResponse.serverError(res)
  }

  return apiResponse.sendJson(res, 'OK', 201)
}

module.exports = { checkStarted }
