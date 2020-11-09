const rootPath = './../../../../..'
const Node = require(`${rootPath}/app/models/Node/Node`)
const PoJob = require(`${rootPath}/app/models/PoRecord/PoJob`)
const PoJobInput = require(`${rootPath}/app/models/PoRecord/PoJob/PoJobInput`)

let step1 = async (req, res) => {
  let nodes = await Node.fetchAll()
  nodes = nodes.toJSON()
  res.render('web/v1/operators/input-materials/step-1', {nodes})
}

let step2 = async (req, res) => {
  let { node_id } = req.body

  let node = (await new Node({id: node_id}).fetch({require: false, withRelated: ['active_po_job.po_record']}))


  if (!node) {
    req.flash('error', `Unable to find the machine`)
    return res.redirect('/operators/input-materials/step-1')
  }
  node = node.toJSON()


  res.render('web/v1/operators/input-materials/step-2', { node })
}

let save = async (req, res) => {
  let userId = req.user.id;
  let {po_job_id, quantity} = req.body;
  // quantity = quantity / 1000;

  let poJob = (await new PoJob({id: po_job_id}).fetch({require: false}))

  if (!poJob) {
    req.flash('error', `Unable to find the PO Job`)
    return res.redirect('/operators/input-materials/step-1')
  }

  poJobInput = await new PoJobInput({po_job_id, quantity, user_id: userId}).save();

  res.redirect('/operators')
}

module.exports = {
  step1,
  step2,
  save,
}
