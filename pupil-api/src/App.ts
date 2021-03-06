'use strict'

import 'dotenv/config'

import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as cors from 'cors'
import * as helmet from 'helmet'
import * as uuidV4 from 'uuid/v4'
import * as winston from 'winston'
import * as azure from './azure'
const corsOptions = require('./helpers/cors-options')
const setupLogging = require('./helpers/logger')

import authRoutes from './routes/auth'
import pingRoute from './routes/ping'

// Creates and configures an ExpressJS web server.
class App {

  // ref to Express instance
  public express: express.Application

  // Run configuration methods on the Express instance.
  constructor () {
    this.express = express()
    this.middleware()
    this.routes()

    azure.startInsightsIfConfigured().catch(e => winston.error(e))
  }

  // Configure Express middleware.
  private middleware (): void {

    /* Logging */

    setupLogging(this.express)

    /* Security Directives */

    this.express.use(cors(corsOptions))
    this.express.use(helmet())

    /* Swagger API documentation */

    if (process.env.NODE_ENV !== 'production') {
      const swaggerUI = require('swagger-ui-express')
      this.express.use('/api-docs', swaggerUI.serve, swaggerUI.setup(require('./swagger.json')))
    }

    // Sets request header "Strict-Transport-Security: max-age=31536000; includeSubDomains".
    const oneYearInSeconds = 31536000
    this.express.use(helmet.hsts({
      maxAge: oneYearInSeconds,
      includeSubDomains: true,
      preload: true
    }))

    // azure uses req.headers['x-arr-ssl'] instead of x-forwarded-proto
    // if production ensure x-forwarded-proto is https OR x-arr-ssl is present
    this.express.use((req, res, next) => {
      if (azure.isAzure()) {
        this.express.enable('trust proxy')
        req.headers['x-forwarded-proto'] = req.header('x-arr-ssl') ? 'https' : 'http'
      }
      next()
    })

    // force HTTPS in azure
    this.express.use((req, res, next) => {
      if (azure.isAzure()) {
        if (req.protocol !== 'https') {
          res.redirect(`https://${req.header('host')}${req.url}`)
        }
      } else {
        next()
      }
    })

    this.express.use(bodyParser.json())
  }

  // Configure API endpoints.
  private routes (): void {
    /* API endpoints */
    this.express.use('/ping', pingRoute)
    this.express.use('/auth', authRoutes)

    if (process.env.VERIFY_OWNER) {
      const token = process.env.VERIFY_OWNER
      this.express.get(`/${token}`, (req, res) => {
        res.contentType('text/plain')
        res.send(token)
      })
    }

    // catch 404 and forward to error handler
    this.express.use(function (req, res, next) {
      let err: any = new Error('Not Found')
      err.status = 404
      next(err)
    })

    // error handler
    this.express.use(function (err, req, res, next) {
      const errorId = uuidV4()
      // only providing error information in development
      // @TODO: change this to a real logger with an error string that contains
      // all pertinent information. Assume 2nd/3rd line support would pick this
      // up from logging web interface (e.g. ELK / LogDNA)
      winston.error('ERROR: ' + err.message + ' ID:' + errorId)
      winston.error(err.stack)

      // return the error as an JSON object
      err.message = err.message || 'An error occurred'
      err.errorId = errorId
      err.status = err.status || 500
      if (req.app.get('env') === 'development') {
        res.status(err.status).json({ error: err.message, errorId: errorId })
      } else {
        res.status(err.status).json({ error: 'An error occurred' })
      }
    })

  }

}

export default new App().express
