'use strict'

const R = require('ramda')

/**
 *
 * @param data
 * @return {string}
 *
 * Data Format
 [ { pupil_id: 12,
   pupilStatusCode: 'UNALLOC',
   check_id: 1,
   checkStatusCode: 'NEW' }
 ]
 */

module.exports = {
  analysePupilData: function analysePupilData (data) {
    if (!data) {
      throw new Error('No data provided')
    }

    if (!Array.isArray(data)) {
      throw new Error('data is not an array')
    }

    const lastCheckTaken = R.last(data)

    // Please see the query for how this data structure is generated (multi-way sql join)
    // Attendance codes override all checks (should any have been taken), so this gets checked early.
    if (lastCheckTaken.pupilAttendance_id) {
      return 'NOT_TAKING'
    }

    switch (lastCheckTaken.checkStatusCode) {
      case null:
        return 'UNALLOC'
      case 'NEW':
        return 'ALLOC'
      case 'COL':
        return 'LOGGED_IN'
      case 'STD':
        return 'STARTED'
      case 'CMP':
        return 'COMPLETED'
      case 'EXP':
        return 'UNALLOC'
    }

    // default
    return 'UNALLOC'
  }
}
