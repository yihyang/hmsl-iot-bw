const rootPath = './../../../../../../..'
const PoRecord = require(`${rootPath}/app/models/PoRecord/PoRecord`)
const Node = require(`${rootPath}/app/models/Node/Node`)
const PoJob = require(`${rootPath}/app/models/PoRecord/PoJob`)

let add = async (req, res) => {
  let {id} = req.params;
  let poRecord = await new PoRecord({id}).fetch({require: false});

  if (!poRecord) {
    req.flash('error', `Unable to find the PO with ID ${id}`)
    return res.redirect('/operators/po-end/step-1')
  }

  let nodes = await Node.fetchAll()
  nodes = nodes.toJSON()

  res.render('web/v1/operators/po-inputs/po-records/po-jobs/add', {nodes, poRecord})
}

let save = async (req, res) => {
  let userId = req.user.id;
  let po_record_id = req.params.id;
  let {node_id} = req.body;

  // validate node exists
  let node = (await new Node({id: node_id}).fetch({require: false}))

  if (!node) {
    req.flash('error', `Unable to find machine with the provided ID`)

    return res.redirect(`/operators/po-inputs/po-records/${po_record_id}`)
  }

  // validate po record exists
  let poRecord = await new PoRecord({id: po_record_id}).fetch({require: false})

  if (!poRecord) {
    req.flash('error', `nable to find PO Record with the provided id`)

    return res.redirect(`/operators/po-inputs/po-records/${po_record_id}`)
  }

  // create po job
  let poJob = (await new PoJob({po_record_id, node_id}).fetch({require: false, withRelated: ['po_record']}))

  if (poJob) {
    await new Node({id: node_id}).save({active_po_job_id: poJob.id}, {patch: true})
    let node = await new Node({id: node_id}).fetch()
    node = node.toJSON()
    let poNumber = poJob.toJSON().po_record.po_number
    req.flash('info', `Update ${node.name} active PO Job to ${poNumber}`)

    return res.redirect(`/operators/po-inputs/po-records/${po_record_id}`)
  }

  poJob = await new PoJob({po_record_id, node_id, user_id: userId, status: 'In Progress'}).save();

  // update node to set active PO Job
  await new Node({id: node_id}).save({active_po_job_id: poJob.id}, {patch: true})

  return res.redirect(`/operators/po-inputs/po-records/${po_record_id}`)
}


module.exports = {
  add,
  save,
}
