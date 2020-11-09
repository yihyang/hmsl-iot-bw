const rootPath = './../../../../..'
const PoJob = require(`${rootPath}/app/models/PoRecord/PoJob`)
const PoRecord = require(`${rootPath}/app/models/PoRecord/PoRecord`)
const PoJobInput = require(`${rootPath}/app/models/PoRecord/PoJob/PoJobInput`)

let step1 = async (req, res) => {
  res.render('web/v1/operators/po-inputs/step-1')
}

let step2 = async (req, res) => {
  let { po_number } = req.body

  let poRecord = (await new PoRecord({po_number}).fetch({require: false, withRelated: ['jobs.node']}));
  if (!poRecord) {
    req.flash('error', `PO Record with "${po_number}" not found`)
    return res.redirect('/operators/po-inputs/step-1')
  }

  poRecord = poRecord.toJSON()

  res.render('web/v1/operators/po-inputs/step-2', {poRecord})
}

let save = async (req, res) => {

}

module.exports = {
  step1,
  step2,
  save,
}
