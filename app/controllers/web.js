const home = require('./web/v1/HomeController')
const nodes = require('./web/v1/NodeController')
const extrusionCycles = require('./web/v1/ExtrusionCycleController')
const meanTimes = require('./web/v1/MeanTimeController')
const oee = require('./web/v1/OEEController')
const users = require('./web/v1/UserController')
const poRecords = require('./web/v1/PoRecordController')
const poJobs = require('./web/v1/PoJobController')
const gwo = require('./web/v1/GwoController')
const operators = require('./web/v1/OperatorController')
const settings = require('./web/v1/SettingController')
const productionSystems = require('./web/v1/ProductionSystemController')

module.exports = {
  v1: {
    extrusionCycles,
    gwo,
    home,
    meanTimes,
    nodes,
    oee,
    operators,
    poJobs,
    poRecords,
    settings,
    users,
    productionSystems,
  }
}
