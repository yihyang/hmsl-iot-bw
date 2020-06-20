const home = require('./web/v1/HomeController')
const nodes = require('./web/v1/NodeController')
const oee = require('./web/v1/OEEController')
const users = require('./web/v1/UserController')
const poRecords = require('./web/v1/PoRecordController')

module.exports = {
  v1: {
    home,
    oee,
    poRecords,
    nodes,
    users
  }
}
