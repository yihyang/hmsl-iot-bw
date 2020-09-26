const OEEHelper = require('./app/helpers/oee');
const schedule = require('node-schedule')
const moment = require('moment')
const {
  asyncForEach
} = require('./app/helpers/loop')

let dates = [];
let today = moment();
let startDate = moment('2020-09-11')
while(startDate.isBefore(today)) {
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
