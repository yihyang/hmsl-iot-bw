const OEEHelper = require('./app/helpers/oee');

const schedule = require('node-schedule')

schedule.scheduleJob('0 5 0 * * *', function() {
  let date = moment().subtract(1, 'day')
  OEEHelper.runAllJob(date)
})
