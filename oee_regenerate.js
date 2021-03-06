const schedule = require('node-schedule')
const moment = require('moment')

const OEEHelper = require('./app/helpers/oee');
const {
  asyncForEach
} = require('./app/helpers/loop')

let dates = [];
let today = moment();
let startDate = moment('2021-01-24')
let endDate = moment('2021-01-25')
while(startDate.isBefore(endDate)) {
  dates.push(startDate.clone())
  startDate.add(1, 'day')
}

async function runJob(dates) {
  await asyncForEach(dates, async function(date) {
    console.log(date)
    OEEHelper.runAllJob(date)
  })
}

runJob(dates)
