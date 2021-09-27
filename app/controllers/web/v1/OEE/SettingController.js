const rootPath = './../../../../..'
const nodeDefaultValues = require('./Setting/NodeDefaultValueController')


let index = async function(req, res) {
  res.render('web/v1/oee/settings/index')
}

module.exports = {
  index,
  nodeDefaultValues,
}
