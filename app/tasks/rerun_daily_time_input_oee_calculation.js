const rootPath = './../..'
const moment = require('moment')

const {
  runSingleNodeAvailabilityJob,
  runSingleNodeOEEJob,
  runSingleNodeCapacityJob,
} = require(`${rootPath}/app/helpers/oee`)

let main = async function(payload, helpers) {
  let { node_id, date } = payload
  date = moment(date)

  await runSingleNodeAvailabilityJob(node_id, date)
  await runSingleNodeCapacityJob(node_id, date)
  await runSingleNodeOEEJob(node_id, date)
}

module.exports = main
