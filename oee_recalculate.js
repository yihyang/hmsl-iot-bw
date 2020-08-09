const schedule = require('node-schedule')

schedule.scheduleJob('*/2 * * * * *', function() {
  console.log('1');
})
