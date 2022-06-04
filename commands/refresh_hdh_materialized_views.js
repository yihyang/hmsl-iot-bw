require('dotenv').config();

const rootPath = './..'
const bookshelf = require(rootPath + '/config/bookshelf')
const moment = require('moment')
const schedule = require('node-schedule')


let main = async () => {
  let sql = 'REFRESH MATERIALIZED VIEW hdh_view.device_events;'
  let now = moment()
  console.log("Started refreshing materialized view - " + now.format())
  await bookshelf.knex.raw(sql)
  let timeEnd = moment()
  console.log("Completed refreshing materialized view - " + timeEnd.format())
  console.log("Time used: " + timeEnd.diff(now, 'seconds') + ' seconds')
}


schedule.scheduleJob('0 10 * * * *', main)
