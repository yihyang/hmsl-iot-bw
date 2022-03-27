const rootPath = './../../../..'
const solderPastes = require('./ProductionSystem/SolderPasteController')
const solderWires = require('./ProductionSystem/SolderWireController')

let index = (req, res) => {
  res.render('web/v1/production-systems/index')
}

module.exports = {
  index,
  solderPastes,
  solderWires,
}
