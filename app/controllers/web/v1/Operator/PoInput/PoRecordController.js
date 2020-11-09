const rootPath = './../../../../../..'
const PoRecord = require(`${rootPath}/app/models/PoRecord/PoRecord`)
const poJobs = require('./PoRecord/PoJobController')

let add = (req, res) => {
  res.render('web/v1/operators/po-inputs/po-records/add')
}

let save = async (req, res) => {
  let userId = req.user.id;
  let {po_number, target_quantity, material_number, target_completion_date} = req.body;

  let poRecord = (await PoRecord.where({po_number}).fetch({require: false}));

  if (poRecord) {
    req.flash('error', `PO Record with number ${po_number} already existed`)
    return res.redirect('/operators/po-inputs/step-1')
  }

  poRecord = await new PoRecord({po_number, material_number, target_quantity, target_completion_date, user_id: userId, status: 'Created'}).save()

  req.flash('success', `Created new PO Record with PO Number "${po_number}"`)
  res.redirect(`/operators/po-inputs/po-records/${poRecord.id}`)
}

let show = async (req, res) => {
  let { id } = req.params;

  let poRecord = await new PoRecord({id}).fetch({require: false, withRelated: ['jobs.node', 'jobs.user']});

  if (!poRecord) {
    req.flash('error', `Unable to find the PO with ID ${id}`)
    return res.redirect('/operators/po-end/step-1')
  }

  poRecord = poRecord.toJSON()

  res.render('web/v1/operators/po-inputs/po-records/show', {poRecord})
}

module.exports = {
  add,
  save,
  show,
  poJobs,
}
