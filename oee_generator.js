const OEEHelper = require('./app/helpers/oee');
const OEENodeGroupHelper = require('./app/helpers/oee/node_group');

const schedule = require('node-schedule')
const moment = require('moment');

async function main() {
  let date = moment().subtract(1, 'day').startOf('day')
  console.log("---- Node ----")
  await OEEHelper.runAllJob(date)
  console.log("\n---- Node Group ----")
  await OEENodeGroupHelper.runAllJob(date)
}
schedule.scheduleJob('0 5 0 * * *', main)
// main()
