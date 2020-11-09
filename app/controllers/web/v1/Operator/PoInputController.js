const rootPath = './../../../../..'
const PoJob = require(`${rootPath}/app/models/PoRecord/PoJob`)
const PoRecord = require(`${rootPath}/app/models/PoRecord/PoRecord`)
const PoJobInput = require(`${rootPath}/app/models/PoRecord/PoJob/PoJobInput`)
// controller
const poRecords = require('./PoInput/PoRecordController')

let step1 = async (req, res) => {
  res.render('web/v1/operators/po-inputs/step-1')
}

let step2 = async (req, res) => {
  let { po_number } = req.body

  let poRecord = (await PoRecord.where({po_number}).fetch({require: false, withRelated: ['jobs.node']}));

  console.log(poRecord)
  if (!poRecord) {
    req.flash('error', `PO Record with "${po_number}" not found`)
    return res.redirect('/operators/po-inputs/step-1')
  }

  poRecord = poRecord.toJSON()

  res.redirect(`/operators/po-inputs/po-records/${poRecord.id}`)
}

let save = async (req, res) => {

}

module.exports = {
  step1,
  step2,
  save,
  poRecords,
}
