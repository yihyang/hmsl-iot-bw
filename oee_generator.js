const OEEHelper = require('./app/helpers/oee');

const schedule = require('node-schedule')
const moment = require('moment');

function main() {
  let date = moment().subtract(1, 'day')
  OEEHelper.runAllJob(date)
}
schedule.scheduleJob('0 5 0 * * *', main)
main()
