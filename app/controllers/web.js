const home = require('./web/v1/HomeController')
const nodes = require('./web/v1/NodeController')
const extrusionCycles = require('./web/v1/ExtrusionCycleController')
const meanTimes = require('./web/v1/MeanTimeController')
const oee = require('./web/v1/OEEController')
const users = require('./web/v1/UserController')
const poRecords = require('./web/v1/PoRecordController')
const gwo = require('./web/v1/GwoController')
const operators = require('./web/v1/OperatorController')
const settings = require('./web/v1/SettingController')

module.exports = {
  v1: {
    extrusionCycles,
    gwo,
    home,
    meanTimes,
    nodes,
    oee,
    operators,
    poRecords,
    settings,
    users,
  }
}
