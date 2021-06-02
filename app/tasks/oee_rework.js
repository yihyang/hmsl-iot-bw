const rootPath = './../..'
const moment = require('moment')

const OEEHelper = require(`${rootPath}/app/helpers/oee`)
const { asyncForEach } = require(`${rootPath}/app/helpers/loop`)
const OEEPerformance = require(`${rootPath}/app/models/OEE/OEEPerformance`)
const OEEAvailability = require(`${rootPath}/app/models/OEE/OEEAvailability`)
const OEE = require(`${rootPath}/app/models/OEE/OEE`)

module.exports = async (payload, helpers) => {
  let { date, groups, node_id } =  payload
  console.log(payload)
  let startOfDay = moment(date).startOf('day')
  let endOfDay = moment(date).endOf('day')

  console.log("[oeeReworkQueue] Starting rework for " + date + " node_id: " + node_id + " groups: " + groups)

  if (groups.includes('availability')) {
    let availabilities = await new OEEAvailability().query(qb => {
      qb.where('start_time', '>=', startOfDay)
        .where('end_time', '<=', endOfDay)
        .where('node_id', node_id)
    }).fetchAll()

    availabilities = availabilities.toJSON()

    await asyncForEach(availabilities, async (availability) => {
      console.log("Reworking availability with ID " + availability.id)
      await OEEHelper.reworkAvailability(availability.id)
    })
  }

  if (groups.includes('performance')) {
    let performances = await new OEEPerformance().query(qb => {
      qb.where('start_time', '>=', startOfDay)
        .where('end_time', '<=', endOfDay)
        .where('node_id', node_id)
    }).fetchAll()

    performances = performances.toJSON()

    await asyncForEach(performances, async (performance) => {
      console.log("Reworking performance with ID " + performance.id)
      await OEEHelper.Performance(performance.id)
    })
  }

    let oees = await (new OEE().query((qb) => {
      qb.where('start_time', '>=', startOfDay)
        .where('end_time', '<=', endOfDay)
        .where('node_id', node_id)
    }).fetchAll())

    oees = oees.toJSON()

    await asyncForEach(oees, async (oee) => {
      await OEEHelper.reworkOEE(oee.id)
    })
  console.log("[oeeReworkQueue] Completed rework for " + date + " node_id: " + node_id + " groups: " + groups)
}
