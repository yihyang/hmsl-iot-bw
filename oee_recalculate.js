const schedule = require('node-schedule')

schedule.scheduleJob('* 5 * * * *', function() {
  console.log('1');
})
