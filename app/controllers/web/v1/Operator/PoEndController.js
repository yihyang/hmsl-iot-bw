const rootPath = './../../../../..'
const moment = require('moment')
const PoRecord = require(`${rootPath}/app/models/PoRecord/PoRecord`)
const PoJob = require(`${rootPath}/app/models/PoRecord/PoJob`)
const Node = require(`${rootPath}/app/models/Node/Node`)

let step1 = async (req, res) => {
  let nodes = await Node.fetchAll()
  nodes = nodes.toJSON()

  res.render('web/v1/operators/po-end/step-1', {nodes})
}

let step2 = async(req, res) => {
  let {po_number} = req.body
  let poRecord = await PoRecord.where({po_number}).fetch({require: false});
  if (!poRecord) {
    req.flash('error', `Unable to find the PO with Number ${po_number}`)
    return res.redirect('/operators/po-end/step-1')
  }

  poRecord = poRecord.toJSON()
  if (poRecord.status === 'Ended') {
    req.flash('error', `Unable to end a PO Record that has been ended`)
    return res.redirect('/operators/po-end/step-1')
  }

  res.render('web/v1/operators/po-end/step-2', {poRecord})
}

let end = async (req, res) => {
  let userId = req.user.id
  let {po_number} = req.body
  let poRecord = await PoRecord.where({po_number}).fetch({require: false});

  if (!poRecord) {
    req.flash('error', `Unable to find the PO with Number ${po_number}`)
    return res.redirect('/operators/po-end/step-1')
  }

  poRecord = poRecord.toJSON()
  if (poRecord.status === 'Ended') {
    req.flash('error', `Unable to end a PO Record that has been ended`)
    return res.redirect('/operators/po-end/step-1')
  }


  let result = await PoRecord.where({id: poRecord.id}).save({status: 'Ended', ended_by: userId, ended_at: moment()}, {patch: true});

  let poJobs = await PoJob.where({po_record_id: poRecord.id}).fetch({require: false});

  if (poJobs) {
    await PoJob.where({po_record_id: poRecord.id}).save({status: 'Ended', ended_by: userId, ended_at: moment()}, {patch: true});
  }

  req.flash('info', `Updated PO Record with number ${po_number} to "ended"`)
  res.redirect('/operators/po-end/step-1')
}

module.exports = {
  step1,
  step2,
  end,
}
