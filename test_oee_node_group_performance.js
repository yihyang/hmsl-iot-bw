const moment = require('moment');
const rootPath = '.'
// const bookshelf = require(`${rootPath}/config/bookshelf`);

const NodeGroupOEEHelper = require('./app/helpers/oee/node_group');

const OEEPerformance = require(`${rootPath}/app/models/OEE/NodeGroup/OEEPerformance`)

async function runJob() {
  let startTime = moment('2021-09-01')
  let endTime = startTime.clone().endOf('day')
  console.log(startTime, endTime)

  await NodeGroupOEEHelper.getPerformanceValue(1, startTime, endTime)
  // await OEEPerformance.
}

runJob()
