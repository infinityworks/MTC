'use strict'

/* global describe beforeEach */

import { pupilAuthenticationService } from '../../services/pupil-authentication.service'
import * as moment from 'moment'

describe('pupilAuthenticationService', () => {
  let mockResult
  let dummyDriver

  beforeEach(() => {
    mockResult = {
      PartitionKey: { '$': 'Edm.String', _: 'bcd42dcd' },
      RowKey: { '$': 'Edm.String', _: '3598' },
      Timestamp: { '$': 'Edm.DateTime', _: new Date() },
      checkCode: { _: '09520D0D-A9CB-4651-9630-DD6698710120' },
      collectedAt: { '$': 'Edm.DateTime', _: '' },
      pinExpiresAt: { '$': 'Edm.DateTime', _: moment().add(8, 'hours').toDate() },
      config: {
        _: '{\n  "questionTime": 6,\n  "loadingTime": 3,\n  "speechSynthesis": false\n}'
      },
      createdAt: { '$': 'Edm.DateTime', _: new Date() },
      isCollected: { _: false },
      pupil: {
        _: '{\n  "firstName": "Unit",\n  "lastName": "Test",\n  "dob": "1 December 1970",\n  "checkCode": "09520D0D-A9CB-4651-9630-DD6698710120"\n}'
      },
      questions: {
        _: '[\n  {\n    "order": 1,\n    "factor1": 2,\n    "factor2": 5\n  },\n  {\n    "order": 2,\n    "factor1": 11,\n    "factor2": 2\n  },\n  {\n    "order": 3,\n    "factor1": 5,\n    "factor2": 10\n  },\n  {\n    "order": 4,\n    "factor1": 4,\n    "factor2": 4\n  },\n  {\n    "order": 5,\n    "factor1": 3,\n    "factor2": 9\n  },\n  {\n"order": 6,\n    "factor1": 2,\n    "factor2": 4\n  },\n  {\n    "order": 7,\n    "factor1": 3,\n    "factor2": 3\n  },\n  {\n    "order": 8,\n    "factor1": 4,\n    "factor2": 9\n  },\n  {\n    "order": 9,\n    "factor1": 6,\n    "factor2": 5\n  },\n  {\n    "order": 10,\n    "factor1": 12,\n    "factor2": 12\n  }\n]'
      },
      school: {
        _: '{\n  "id": 2,\n  "name": "Example School"\n}'
      },
      tokens: {
        _: '{\n  "completedCheck": {\n    "sasToken": "st=token",\n    "url": "https://example.com/check-complete"\n  },\n  "jwtToken": "someToken"\n}'
      },
      updatedAt: { '$': 'Edm.DateTime', _: new Date() },
      '.metadata': {
        metadata: 'https://example.com/queue/foo',
        etag: 'W/"datetime\'2018-08-21T13%3A25%3A37.1004844Z\'"'
      }
    }

    dummyDriver = {
      retrieveEntityAsync: jasmine.createSpy().and.returnValue(Promise.resolve({
        result: mockResult
      })),
      replaceEntityAsync: jasmine.createSpy().and.returnValue(Promise.resolve({
        response: { isSuccessful: true }
      }))
    }
  })

  it('makes a call to retrieveEntityAsync', async () => {
    await pupilAuthenticationService.authenticate('1234', 'pin1', dummyDriver)
    expect(dummyDriver.retrieveEntityAsync).toHaveBeenCalled()
  })

  it('denies authentication if the pin expiry is missing', async () => {
    delete mockResult.pinExpiresAt
    try {
      await pupilAuthenticationService.authenticate('1234', 'pin1', dummyDriver)
      fail('expected to throw')
    } catch (error) {
      expect(error.message).toBe('PIN expiry is missing 09520D0D-A9CB-4651-9630-DD6698710120')
    }
  })

  it('denies authentication if the pin expiry date has past', async () => {
    mockResult.pinExpiresAt = { '$': 'Edm.DateTime', _: moment().subtract(1, 'minute').toDate() }
    try {
      await pupilAuthenticationService.authenticate('1234', 'pin1', dummyDriver)
      fail('expected to throw')
    } catch (error) {
      expect(error.message).toBe('PIN has expired 09520D0D-A9CB-4651-9630-DD6698710120')
    }
  })
})
