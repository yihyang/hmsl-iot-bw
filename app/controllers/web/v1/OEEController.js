const rootPath = './../../..'
let dailyTimeInputs = require('./OEE/DailyTimeInputController')
let dashboard = require('./OEE/DashboardController')
let details = require('./OEE/DetailController')

let index = async function(req, res) {
  res.render('web/v1/oee/index')
}

module.exports = {
  index,
  dailyTimeInputs,
  dashboard,
  details
}
