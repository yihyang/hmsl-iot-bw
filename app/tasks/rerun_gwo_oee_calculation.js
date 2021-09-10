const rootPath = './../..'
const moment = require('moment')

const {
  runSingleNodePerformanceJob,
  runSingleNodeOEEJob,
} = require(`${rootPath}/app/helpers/oee`)
const {
  getDateRange
} = require(`${rootPath}/app/helpers/date_helper`)
const {
  asyncForEach
} = require(`${rootPath}/app/helpers/loop`)

let main = async function(payload, helpers) {
  let { node_ids, start_time, end_time } = payload
  let dateRanges = getDateRange(start_time, end_time)

  await asyncForEach(node_ids, async (nodeId) => {
    await asyncForEach(dateRanges, async (date) => {
      console.log(`Running Job for NODE id ${nodeId} - ${date}`)
      date = moment(date)
      await runSingleNodePerformanceJob(nodeId, date)
      await runSingleNodeOEEJob(nodeId, date)
    })
  })
}

module.exports = main
