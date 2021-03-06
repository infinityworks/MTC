/* global describe, expect, it */

const moment = require('moment')
const resultPresenter = require('../../../helpers/result-presenter')

describe('resultPresenter', () => {
  describe('getResultsViewData', () => {
    it('provides a score if no attendance reason is detected', () => {
      const dateOfBirth = moment.utc().subtract(7, 'year')
      const pupils = [{
        foreName: 'foreName',
        lastName: 'lastName',
        middleNames: 'middleNames',
        dateOfBirth: dateOfBirth,
        mark: 5,
        reason: null,
        group_id: 1
      }]
      const pupilData = resultPresenter.getResultsViewData(pupils)
      expect(pupilData).toEqual([{
        foreName: 'foreName',
        lastName: 'lastName',
        middleNames: 'middleNames',
        fullName: 'lastName, foreName',
        dateOfBirth: dateOfBirth,
        score: 5,
        reason: null,
        group_id: 1
      }])
    })
    it('returns a dash as score when attendance reason is detected', () => {
      const dateOfBirth = moment.utc().subtract(7, 'year')
      const pupils = [{
        foreName: 'foreName',
        lastName: 'lastName',
        middleNames: 'middleNames',
        dateOfBirth: dateOfBirth,
        mark: 5,
        reason: 'Absent',
        group_id: 1
      }]
      const pupilData = resultPresenter.getResultsViewData(pupils)
      expect(pupilData).toEqual([{
        foreName: 'foreName',
        lastName: 'lastName',
        middleNames: 'middleNames',
        fullName: 'lastName, foreName',
        dateOfBirth: dateOfBirth,
        score: '-',
        reason: 'Absent',
        group_id: 1
      }])
    })
  })
})
