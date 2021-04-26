// rework availabilities if daily input was changed
const rootPath = './'
const schedule = require('node-schedule')
const OEEAvailability = require(`${rootPath}/app/models/OEE/OEEAvailability`)
const OEEPerformance = require(`${rootPath}/app/models/OEE/OEEPerformance`)
const OEE = require(`${rootPath}/app/models/OEE/OEE`)
const _ = require('lodash')
const moment = require('moment')
const OEEHelper = require(`${rootPath}/app/helpers/oee`)
const Node = require(`${rootPath}/app/models/Node/Node`)
const {
  asyncForEach
} = require(`${rootPath}/app/helpers/loop`)


async function runAvailabilityJob() {
  console.log("[OEERework.runAvailabilityJob] Start runAvailabilityJob")
  // check availability for rework
  let availabilities = await (new OEEAvailability().query((qb) => {
    qb.where('need_rework', true)
  }).fetchAll({require: false}));


  if (!availabilities) {
    return;
  }

  availabilities = availabilities.toJSON()
  asyncForEach(availabilities, async (a) => {
    await OEEHelper.reworkAvailability(a.id)
    let { start_time, end_time, node_id } = a

    // find the related OEE
    let oees = await (new OEE().query((qb) => {
      qb.where('start_time', start_time)
        .where('end_time', end_time)
        .where('node_id', node_id)
    }).fetchAll())

    oees = oees.toJSON()

    asyncForEach(oees, async (oee) => {
      await OEEHelper.reworkOEE(oee.id)
    })
  })
}

async function runPerformanceJob() {
  console.log("[OEERework.runPerformanceJob] Start runPerformanceJob")
  // check availability for rework
  let performances = await (new OEEPerformance().query((qb) => {
    qb.where('need_rework', true)
  }).fetchAll({require: false}));


  if (!performances) {
    return;
  }

  performances = performances.toJSON()
  asyncForEach(performances, async (a) => {
    await OEEHelper.reworkPerformance(a.id)
    let { start_time, end_time, node_id } = a

    // find the related OEE
    let oees = await (new OEE().query((qb) => {
      qb.where('start_time', start_time)
        .where('end_time', end_time)
        .where('node_id', node_id)
    }).fetchAll())

    oees = oees.toJSON()

    asyncForEach(oees, async (oee) => {
      await OEEHelper.reworkOEE(oee.id)
    })
  })
}

async function runJob() {
  console.log("[OEERework] Start OEE Rework at " + moment().toISOString())
  await runAvailabilityJob()
  await runPerformanceJob()
}


// rework OEE that has been checked
// start at every 5 seconds of minutes
schedule.scheduleJob('5 * * * * *', runJob)

runJob()
