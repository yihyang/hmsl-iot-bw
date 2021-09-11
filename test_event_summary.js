const rootPath = '.'
const moment = require('moment')
const Event = require(`${rootPath}/app/models/Node/Event`)

async function runJob() {
  let result = await Event.getEventsBetween(1, moment('2021-07-25 23:00:00'), moment('2021-08-06 20:59:59'))
  // let result = await Event.getEventsBetween(2, moment('2021-08-22 05:00:00'), moment('2021-08-22 05:59:59'))

  console.log(result)
}

runJob()

