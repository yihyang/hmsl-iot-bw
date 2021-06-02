
const rootPath = './../..'

const { addJob } = require(`${rootPath}/queue_add_job`)
// NOTE: this is the trigger
let oeeReworkQueue = async (nodeId, date, groups) => {
  await addJob(
    'oee_rework',
    {
      node_id: nodeId,
      date,
      groups
    }
  )
}

module.exports = {
  oeeReworkQueue
}
