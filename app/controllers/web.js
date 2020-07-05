const home = require('./web/v1/HomeController')
const nodes = require('./web/v1/NodeController')
const oee = require('./web/v1/OEEController')
const users = require('./web/v1/UserController')
const poRecords = require('./web/v1/PoRecordController')
const gwo = require('./web/v1/GwoController')
const settings = require('./web/v1/SettingController')

module.exports = {
  v1: {
    home,
    oee,
    gwo,
    poRecords,
    nodes,
    users,
    settings
  }
}
