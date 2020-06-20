const rootPath = './../../../..'
const PoRecord = require(`${rootPath}/app/models/PoRecord/PoRecord`)
const PoJob = require(`${rootPath}/app/models/PoRecord/PoJob`)
const Node = require(`${rootPath}/app/models/Node/Node`)
const {respondError, respondSuccessWithData} = require(`${rootPath}/app/helpers/response`)

let save = async function (req, res) {
  let userId = req.user.id;
  let {po_record_id, node_name} = req.body;

  // validate node exists
  let node = (await new Node({name: node_name}).fetch({require: false}))

  if (!node) {
    return res
      .status(404)
      .json(
        respondError("Machine not found", "Unable to find machine with the provided name", 404)
      )
  }

  let node_id = node.id;

  // validate po record exists
  let poRecord = await new PoRecord({id: po_record_id}).fetch({require: false})

  if (!poRecord) {
    return res
      .status(404)
      .json(
        respondError("Po Record not found", "Unable to find PO Record with the provided id", 404)
      )
  }

  // create po job
  let poJob = (await new PoJob({po_record_id, node_id}).fetch({require: false}))

  if (poJob) {
    return res
      .status(422)
      .json(
        respondError("Duplicated Record", "PO Job with the same po record and machine found", 422)
      )
  }

  poJob = await new PoJob({po_record_id, node_id, user_id: userId, status: 'In Progress'}).save();

  // update node to set active PO Job
  await new Node({id: node_id}).save({active_po_job_id: poJob.id}, {patch: true})

  poJob = poJob.toJSON();

  res.status(201)
    .json(
      respondSuccessWithData(
        "Object created",
        "Created new PO Job",
        poJob,
        201
      )
    )
}

module.exports = {
  save
}
