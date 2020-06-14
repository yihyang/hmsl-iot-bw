const home = require('./web/v1/HomeController')
const nodes = require('./web/v1/NodeController')
const users = require('./web/v1/UserController')

module.exports = {
  v1: {
    home,
    nodes,
    users
  }
}
