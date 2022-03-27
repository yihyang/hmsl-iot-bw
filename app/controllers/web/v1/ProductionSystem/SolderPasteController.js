const bagScanning = require('./SolderPaste/BagScanningController')
const records = require('./SolderPaste/RecordController')
const reports = require('./SolderPaste/ReportController')

let index = (req, res) => {
  res.render('web/v1/production-systems/solder-pastes/index')
}

let add = (req, res) => {

}

let save = (req, res) => {

}

module.exports = {
  index,
  add,
  save,
  bagScanning,
  records,
  reports,
}
