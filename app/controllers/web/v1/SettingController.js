const rootPath = '../../../..'
const users = require('./Setting/UserController')

let index = async function(req, res) {
  res.render('web/v1/settings/index')
}

module.exports = {
  index,
  users
}
