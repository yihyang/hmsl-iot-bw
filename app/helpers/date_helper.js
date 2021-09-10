const moment = require('moment')

let getDateRange = (startTime, endTime) => {
  startTime = moment(startTime)
  endTime = moment(endTime)
  let dateRanges = [];
  for (let currentTime = startTime.clone(); currentTime.isBefore(endTime); currentTime.add(1, 'day')) {
    dateRanges.push(currentTime.format('YYYY-MM-DD'))
  }

  return dateRanges
}

module.exports = {
  getDateRange,
}
