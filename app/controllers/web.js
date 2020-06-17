const home = require('./web/v1/HomeController')
const nodes = require('./web/v1/NodeController')
const oee = require('./web/v1/OEEController')
const users = require('./web/v1/UserController')
const poOutputs = require('./web/v1/POOutputController')

module.exports = {
  v1: {
    home,
    oee,
    poOutputs,
    nodes,
    users
  }
}
