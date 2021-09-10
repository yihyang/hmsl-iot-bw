const rootPath = './../..'
require('dotenv').config();
const { connectionString } = require(`${rootPath}/queue_add_job`)
const {
  quickAddJob,
} = require("graphile-worker");
const moment = require('moment')

let addJob = async function(jobName, payload, options = {}) {
  await quickAddJob(
    {connectionString},
    jobName,
    payload,
    options,
  )
}

let addRerunDailyTimeInputOeeJob = async function(nodeId, date) {
  let jobKey = 'rerun_daily_time_input_oee_calculation-' + nodeId + '-' + date
  addJob('rerun_daily_time_input_oee_calculation', {node_id: nodeId, date}, {job_key: jobKey})
}

let addRerunGwoOeeJob = async function(nodeIds, startTime, endTime) {
  let jobKey = 'rerun_gwo_oee_calculation-' + nodeIds + '-' + startTime + '-' + endTime
  addJob('rerun_gwo_oee_calculation', {node_ids: nodeIds, start_time: startTime, end_time: endTime}, {job_key: jobKey})
}

module.exports = {
  addRerunDailyTimeInputOeeJob,
  addRerunGwoOeeJob,
}
