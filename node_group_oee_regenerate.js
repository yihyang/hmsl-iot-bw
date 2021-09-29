const schedule = require('node-schedule')
const moment = require('moment')

const NodeGroupOEEHelper = require('./app/helpers/oee/node_group');
const {
  asyncForEach
} = require('./app/helpers/loop')

let dates = [];
let today = moment();
let startDate = moment('2021-09-01')
let endDate = moment('2021-09-30')
while(startDate.isBefore(endDate)) {
  dates.push(startDate.clone())
  startDate.add(1, 'day')
}

async function runJob(dates) {
  await asyncForEach(dates, async function(date) {
    console.log(date.toISOString())
    // await NodeGroupOEEHelper.runAvailabilityJob(date)
    // await NodeGroupOEEHelper.runQualityJob(date)
    await NodeGroupOEEHelper.runAllJob(date)
  })
}

runJob(dates)
