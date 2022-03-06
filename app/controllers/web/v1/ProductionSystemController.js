const rootPath = './../../../..'
const solderPastes = require('./ProductionSystem/SolderPasteController')

let index = (req, res) => {
  res.render('web/v1/production-systems/index')
}

module.exports = {
  index,
  solderPastes,
}
