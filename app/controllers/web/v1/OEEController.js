const rootPath = './../../..'
let dailyTimeInputs = require('./OEE/DailyTimeInputController')

let index = async function(req, res) {
  res.render('web/v1/oee/index')
}

module.exports = {
  index,
  dailyTimeInputs
}
