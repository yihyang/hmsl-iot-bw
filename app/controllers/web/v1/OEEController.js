const rootPath = './../../..'
let dailyTimeInputs = require('./OEE/DailyTimeInputController')
let dashboard = require('./OEE/DashboardController')
const nodeGroupDashboard = require('./OEE/NodeGroup/DashboardController')
let details = require('./OEE/DetailController')
let settings = require('./OEE/SettingController')

let index = async function(req, res) {
  res.render('web/v1/oee/index')
}

module.exports = {
  index,
  dailyTimeInputs,
  dashboard,
  details,
  settings,
  nodeGroup: {
    dashboard: nodeGroupDashboard
  }
}
