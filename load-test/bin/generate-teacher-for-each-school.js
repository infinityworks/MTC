const winston = require('winston')
const bcrypt = require('bcryptjs')
const { TYPES } = require('tedious')
const sqlService = require('../../admin/services/data-access/sql.service')
const sqlPoolService = require('../../admin/services/data-access/sql.pool.service')

async function main () {
  try {
    const password = process.argv[2] || 'password'
    const passwordHash = bcrypt.hashSync(password)
    const schools = await sqlService.query('SELECT id FROM school')
    const numSchools = schools.length
    let school, teacherIdentifier

    winston.info(`Generating 1 teacher with password '${password}' for ${numSchools} schools`)

    for (let i = 0; i < numSchools; i++) {
      school = schools[i]
      teacherIdentifier = `teacher${i + 1}`

      // maybe use sqlService.generateParams
      let params = [
        {
          name: 'schoolId',
          value: school.id,
          type: TYPES.Int
        },
        {
          name: 'passwordHash',
          value: passwordHash,
          type: TYPES.NVarChar
        },
        {
          name: 'teacherIdentifier',
          value: teacherIdentifier,
          type: TYPES.NVarChar
        }
      ]

      const sql = `
        INSERT INTO ${sqlService.adminSchema}.[user] (identifier, passwordHash, school_id, role_id)
        VALUES (@teacherIdentifier, @passwordHash, @schoolId, 3)
      `

      try {
        await sqlService.query(sql, params)
      } catch (error) {
        // Catch unique constraint errors
        // We’re doing this in case teachers with the same identifier exist so we don’t override them
        // This makes the assumption that the existing users password is a hash of 'password'
        // and we can't be sure there is 1 user per school
        if (error.number !== 2627) {
          throw error
        }
      }
    }

    winston.info('Done')
    sqlPoolService.drain()
  } catch (error) {
    winston.info(error)
    process.exitCode = 1
    sqlPoolService.drain()
  }
}

main()
