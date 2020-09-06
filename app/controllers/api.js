const auth = require('./api/AuthController')
const node = require('./api/v1/NodeController')
const poRecord = require('./api/v1/PoRecordController')
const poJob = require('./api/v1/PoJobController')
const poJobInput = require('./api/v1/PoJobInputController')
const poBatch = require('./api/v1/PoBatchController')

module.exports = {
  auth,
  v1: {
    poRecord,
    poJob,
    poJobInput,
    poBatch,
    node,
  }
}
