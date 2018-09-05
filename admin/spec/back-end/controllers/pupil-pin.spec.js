'use strict'

/* global describe beforeEach it expect jasmine spyOn */
const httpMocks = require('node-mocks-http')

const checkStartService = require('../../../services/check-start.service')
const dateService = require('../../../services/date.service')
const pinGenerationService = require('../../../services/pin-generation.service')
const pinService = require('../../../services/pin.service')
const checkWindowSanityCheckService = require('../../../services/check-window-sanity-check.service')
const pupilDataService = require('../../../services/data-access/pupil.data.service')
const qrService = require('../../../services/qr.service')
const schoolDataService = require('../../../services/data-access/school.data.service')
const groupService = require('../../../services/group.service')
const schoolMock = require('../mocks/school')
const groupsMock = require('../mocks/groups')

describe('pupilPin controller:', () => {
  function getRes () {
    const res = httpMocks.createResponse()
    res.locals = {}
    return res
  }

  function getReq (params) {
    const req = httpMocks.createRequest(params)
    req.user = { School: 9991001 }
    req.breadcrumbs = jasmine.createSpy('breadcrumbs')
    req.flash = jasmine.createSpy('flash')
    return req
  }

  describe('getGeneratePinsOverview route', () => {
    let goodReqParamsLive = {
      method: 'GET',
      url: '/pupil-pin/generate-live-pins-overview',
      params: {
        pinEnv: 'live'
      },
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }
    let goodReqParamsFam = {
      method: 'GET',
      url: '/pupil-pin/generate-familiarisation-pins-overview',
      params: {
        pinEnv: 'familiarisation'
      },
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    describe('for live pins', () => {
      it('displays the generate pins overview page if no active pins are present', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParamsLive)
        const controller = require('../../../controllers/pupil-pin').getGeneratePinsOverview
        spyOn(res, 'render').and.returnValue(null)
        spyOn(pinService, 'getPupilsWithActivePins').and.returnValue([])
        spyOn(checkWindowSanityCheckService, 'check')
        await controller(req, res)
        expect(res.locals.pageTitle).toBe('PINs for live check')
        expect(res.render).toHaveBeenCalled()
        done()
      })
    })

    describe('for familiarisation pins', () => {
      it('displays the generate pins overview page if no active pins are present', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParamsFam)
        const controller = require('../../../controllers/pupil-pin').getGeneratePinsOverview
        spyOn(res, 'render').and.returnValue(null)
        spyOn(pinService, 'getPupilsWithActivePins').and.returnValue([])
        spyOn(checkWindowSanityCheckService, 'check')
        await controller(req, res)
        expect(res.locals.pageTitle).toBe('PINs for familiarisation check')
        expect(res.render).toHaveBeenCalled()
        done()
      })
    })
  })

  describe('getGeneratePinsList route', () => {
    let next
    let controller
    let goodReqParamsLive = {
      method: 'GET',
      url: '/pupil-pin/generate-live-pins-list',
      params: {
        pinEnv: 'live'
      },
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }
    let goodReqParamsFam = {
      method: 'GET',
      url: '/pupil-pin/generate-familiarisation-pins-list',
      params: {
        pinEnv: 'familiarisation'
      },
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    beforeEach(() => {
      next = jasmine.createSpy('next')
    })

    describe('for live pins', () => {
      describe('when the school is found in the database', () => {
        beforeEach(() => {
          controller = require('../../../controllers/pupil-pin').getGeneratePinsList
          spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(Promise.resolve(schoolMock))
        })

        it('displays the generate pins list page', async () => {
          const res = getRes()
          const req = getReq(goodReqParamsLive)
          spyOn(pinGenerationService, 'getPupils').and.returnValue(Promise.resolve({}))
          spyOn(groupService, 'findGroupsByPupil').and.returnValue(groupsMock)
          spyOn(res, 'render').and.returnValue(null)
          await controller(req, res, next)
          expect(res.locals.pageTitle).toBe('Select pupils')
          expect(res.render).toHaveBeenCalled()
        })
      })
    })

    describe('for familiarisation pins', () => {
      describe('when the school is found in the database', () => {
        beforeEach(() => {
          controller = require('../../../controllers/pupil-pin').getGeneratePinsList
          spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(Promise.resolve(schoolMock))
        })

        it('displays the generate pins list page', async () => {
          const res = getRes()
          const req = getReq(goodReqParamsFam)
          spyOn(pinGenerationService, 'getPupils').and.returnValue(Promise.resolve({}))
          spyOn(groupService, 'findGroupsByPupil').and.returnValue(groupsMock)
          spyOn(res, 'render').and.returnValue(null)
          await controller(req, res, next)
          expect(res.locals.pageTitle).toBe('Select pupils')
          expect(res.render).toHaveBeenCalled()
        })
      })

      describe('when the school is not found in the database', () => {
        beforeEach(() => {
          controller = require('../../../controllers/pupil-pin').getGeneratePinsList
          spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(Promise.resolve(undefined))
        })

        it('it throws an error', async () => {
          const res = getRes()
          const req = getReq(goodReqParamsFam)
          await controller(req, res, next)
          expect(next).toHaveBeenCalled()
        })
      })
    })
  })

  describe('postGeneratePins route', () => {
    let next
    let goodReqParamsLive = {
      method: 'POST',
      url: '/pupil-pin/generate-live-pins-list',
      params: {
        pinEnv: 'live'
      },
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      },
      body: {
        pupil: [ '595cd5416e5ca13e48ed2519', '595cd5416e5ca13e48ed2520' ]
      }
    }
    let goodReqParamsFam = {
      method: 'POST',
      url: '/pupil-pin/generate-familiarisation-pins-list',
      params: {
        pinEnv: 'familiarisation'
      },
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      },
      body: {
        pupil: [ '595cd5416e5ca13e48ed2519', '595cd5416e5ca13e48ed2520' ]
      }
    }

    beforeEach(() => {
      next = jasmine.createSpy('next')
    })

    describe('for live pins', () => {
      it('displays the generated pins list page after successful saving', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParamsLive)
        const controller = require('../../../controllers/pupil-pin.js').postGeneratePins

        spyOn(checkStartService, 'prepareCheck')
        spyOn(checkStartService, 'prepareCheck2')
        spyOn(pinGenerationService, 'updatePupilPins').and.returnValue(null)
        spyOn(pupilDataService, 'sqlUpdate').and.returnValue(null)
        spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(schoolMock)
        spyOn(pinGenerationService, 'generateSchoolPassword').and.returnValue({ schoolPin: '', pinExpiresAt: '' })
        spyOn(schoolDataService, 'sqlUpdate').and.returnValue(null)
        spyOn(res, 'redirect').and.returnValue(null)

        await controller(req, res, next)
        expect(res.redirect).toHaveBeenCalledWith('/pupil-pin/view-and-print-live-pins')
        done()
      })

      it('displays the generate pins list page if no pupil list is provided', async (done) => {
        const res = getRes()
        const req = { body: {}, params: { pinEnv: 'live' } }
        const controller = require('../../../controllers/pupil-pin.js').postGeneratePins
        spyOn(checkStartService, 'prepareCheck')
        spyOn(checkStartService, 'prepareCheck2')
        spyOn(pinGenerationService, 'updatePupilPins').and.returnValue(null)
        spyOn(pupilDataService, 'sqlUpdate').and.returnValue(null)
        spyOn(pinGenerationService, 'generateSchoolPassword').and.returnValue(null)
        spyOn(res, 'redirect').and.returnValue(null)
        await controller(req, res, next)
        expect(res.redirect).toHaveBeenCalledWith('/pupil-pin/generate-live-pins-list')
        done()
      })

      it('calls next with an error if school is not found', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParamsLive)
        const controller = require('../../../controllers/pupil-pin.js').postGeneratePins
        spyOn(checkStartService, 'prepareCheck')
        spyOn(checkStartService, 'prepareCheck2')
        spyOn(pinGenerationService, 'updatePupilPins').and.returnValue(null)
        spyOn(pupilDataService, 'sqlUpdate').and.returnValue(null)
        spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(undefined)
        await controller(req, res, next)
        expect(next).toHaveBeenCalled()
        done()
      })
    })

    describe('for familiarisation pins', () => {
      it('displays the generated pins list page after successful saving', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParamsFam)
        const controller = require('../../../controllers/pupil-pin.js').postGeneratePins

        spyOn(checkStartService, 'prepareCheck')
        spyOn(checkStartService, 'prepareCheck2')
        spyOn(pinGenerationService, 'updatePupilPins').and.returnValue(null)
        spyOn(pupilDataService, 'sqlUpdate').and.returnValue(null)
        spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(schoolMock)
        spyOn(pinGenerationService, 'generateSchoolPassword').and.returnValue({ schoolPin: '', pinExpiresAt: '' })
        spyOn(schoolDataService, 'sqlUpdate').and.returnValue(null)
        spyOn(res, 'redirect').and.returnValue(null)

        await controller(req, res, next)
        expect(res.redirect).toHaveBeenCalledWith('/pupil-pin/view-and-print-familiarisation-pins')
        done()
      })

      it('displays the generate pins list page if no pupil list is provided', async (done) => {
        const res = getRes()
        const req = { body: {}, params: { pinEnv: 'familiarisation' } }
        const controller = require('../../../controllers/pupil-pin.js').postGeneratePins
        spyOn(checkStartService, 'prepareCheck')
        spyOn(checkStartService, 'prepareCheck2')
        spyOn(pinGenerationService, 'updatePupilPins').and.returnValue(null)
        spyOn(pupilDataService, 'sqlUpdate').and.returnValue(null)
        spyOn(pinGenerationService, 'generateSchoolPassword').and.returnValue(null)
        spyOn(res, 'redirect').and.returnValue(null)
        await controller(req, res, next)
        expect(res.redirect).toHaveBeenCalledWith('/pupil-pin/generate-familiarisation-pins-list')
        done()
      })

      it('calls next with an error if school is not found', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParamsFam)
        const controller = require('../../../controllers/pupil-pin.js').postGeneratePins
        spyOn(checkStartService, 'prepareCheck')
        spyOn(checkStartService, 'prepareCheck2')
        spyOn(pinGenerationService, 'updatePupilPins').and.returnValue(null)
        spyOn(pupilDataService, 'sqlUpdate').and.returnValue(null)
        spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(undefined)
        await controller(req, res, next)
        expect(next).toHaveBeenCalled()
        done()
      })
    })
  })

  describe('getViewAndPrintPins route', () => {
    let next
    let goodReqParamsLive = {
      method: 'POST',
      url: '/pupil-pin/view-and-print-live-pins',
      params: {
        pinEnv: 'live'
      },
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }
    let goodReqParamsFam = {
      method: 'POST',
      url: '/pupil-pin/view-and-print-familiarisation-pins',
      params: {
        pinEnv: 'familiarisation'
      },
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    beforeEach(() => {
      next = jasmine.createSpy('next')
    })

    describe('for live pins', () => {
      it('displays the generated pupils list and password', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParamsLive)
        const controller = require('../../../controllers/pupil-pin.js').getViewAndPrintPins
        spyOn(pinService, 'getPupilsWithActivePins').and.returnValue([])
        spyOn(groupService, 'assignGroupsToPupils').and.returnValue([])
        spyOn(pinService, 'getActiveSchool').and.returnValue(null)
        spyOn(checkWindowSanityCheckService, 'check')
        spyOn(res, 'render').and.returnValue(null)
        await controller(req, res, next)
        expect(res.render).toHaveBeenCalled()
        done()
      })
      it('calls next if error occurs', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParamsLive)
        const controller = require('../../../controllers/pupil-pin.js').getViewAndPrintPins
        spyOn(pinService, 'getPupilsWithActivePins').and.returnValue(Promise.reject(new Error('error')))
        await controller(req, res, next)
        expect(next).toHaveBeenCalled()
        done()
      })
    })

    describe('for familiarisation pins', () => {
      it('displays the generated pupils list and password', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParamsFam)
        const controller = require('../../../controllers/pupil-pin.js').getViewAndPrintPins
        spyOn(pinService, 'getPupilsWithActivePins').and.returnValue([])
        spyOn(groupService, 'assignGroupsToPupils').and.returnValue([])
        spyOn(pinService, 'getActiveSchool').and.returnValue(null)
        spyOn(checkWindowSanityCheckService, 'check')
        spyOn(res, 'render').and.returnValue(null)
        await controller(req, res, next)
        expect(res.render).toHaveBeenCalled()
        done()
      })
      it('calls next if error occurs', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParamsFam)
        const controller = require('../../../controllers/pupil-pin.js').getViewAndPrintPins
        spyOn(pinService, 'getPupilsWithActivePins').and.returnValue(Promise.reject(new Error('error')))
        await controller(req, res, next)
        expect(next).toHaveBeenCalled()
        done()
      })
    })
  })

  describe('getViewAndCustomPrintPins route', () => {
    let next
    let goodReqParamsLive = {
      method: 'POST',
      url: '/pupil-pin/view-and-custom-print-live-pins',
      params: {
        pinEnv: 'live'
      },
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }
    let goodReqParamsFam = {
      method: 'POST',
      url: '/pupil-pin/view-and-custom-print-familiarisation-pins',
      params: {
        pinEnv: 'familiarisation'
      },
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    beforeEach(() => {
      next = jasmine.createSpy('next')
    })

    describe('for live pins', () => {
      it('displays the generated pupils list and password', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParamsLive)
        const controller = require('../../../controllers/pupil-pin.js').getViewAndCustomPrintPins
        spyOn(pinService, 'getPupilsWithActivePins').and.returnValue([])
        spyOn(groupService, 'findGroupsByPupil').and.returnValue([])
        spyOn(groupService, 'assignGroupsToPupils').and.returnValue([])
        spyOn(pinService, 'getActiveSchool').and.returnValue(null)
        spyOn(dateService, 'formatDayAndDate').and.returnValue('')
        spyOn(qrService, 'getDataURL').and.returnValue('')
        spyOn(checkWindowSanityCheckService, 'check')
        spyOn(res, 'render').and.returnValue(null)
        await controller(req, res, next)
        expect(res.render).toHaveBeenCalled()
        done()
      })
      it('calls next if error occurs', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParamsLive)
        const controller = require('../../../controllers/pupil-pin.js').getViewAndCustomPrintPins
        spyOn(pinService, 'getPupilsWithActivePins').and.returnValue(Promise.reject(new Error('error')))
        await controller(req, res, next)
        expect(next).toHaveBeenCalled()
        done()
      })
    })

    describe('for familiarisation pins', () => {
      it('displays the generated pupils list and password', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParamsFam)
        const controller = require('../../../controllers/pupil-pin.js').getViewAndCustomPrintPins
        spyOn(pinService, 'getPupilsWithActivePins').and.returnValue([])
        spyOn(groupService, 'findGroupsByPupil').and.returnValue([])
        spyOn(groupService, 'assignGroupsToPupils').and.returnValue([])
        spyOn(pinService, 'getActiveSchool').and.returnValue(null)
        spyOn(dateService, 'formatDayAndDate').and.returnValue('')
        spyOn(qrService, 'getDataURL').and.returnValue('')
        spyOn(checkWindowSanityCheckService, 'check')
        spyOn(res, 'render').and.returnValue(null)
        await controller(req, res, next)
        expect(res.render).toHaveBeenCalled()
        done()
      })
      it('calls next if error occurs', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParamsFam)
        const controller = require('../../../controllers/pupil-pin.js').getViewAndCustomPrintPins
        spyOn(pinService, 'getPupilsWithActivePins').and.returnValue(Promise.reject(new Error('error')))
        await controller(req, res, next)
        expect(next).toHaveBeenCalled()
        done()
      })
    })
  })
})