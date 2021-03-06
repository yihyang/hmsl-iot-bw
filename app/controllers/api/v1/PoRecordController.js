const rootPath = './../../../..'
const PoRecord = require(`${rootPath}/app/models/PoRecord/PoRecord`)
const PoJob = require(`${rootPath}/app/models/PoRecord/PoJob`)
const Node = require(`${rootPath}/app/models/Node/Node`)
const moment = require('moment')
const {respondError, respondSuccessWithData} = require(`${rootPath}/app/helpers/response`)

// let index = function (req, res) {

// }

let showByPoNumber = async function(req, res) {
  let {poNumber} = req.params;
  let poRecord = (await new PoRecord({po_number: poNumber}).fetch({require: false, withRelated: ['jobs.node']}));

  if (!poRecord) {
    return res
      .status(404)
      .json(
        respondError("Not Found", "Unable to find PO with provided PO Number")
      )
  }

  poRecord = poRecord.toJSON();
  res.status(200)
    .json(
      respondSuccessWithData(
        "Object found",
        "Found PO with provided PO Number",
        poRecord
      )
    )
}

let latestPoByNodeNumber = async function(req, res) {
  let {name} = req.params;
  let node = (await new Node({name: name}).fetch({require: false, withRelated: ['active_po_job.po_record']}));

  if (!node) {
    return res
      .status(404)
      .json(
        respondError("Machine Not Found", "Unable to find Machine with provided Machine Name")
      )
  }

  node = node.toJSON()
  if (!node.active_po_job) {
    return res
      .status(404)
      .json(
        respondError("Active PO Job Not Found", "Unable to find Active PO Job on the machine")
      )
  }

  res.status(200)
    .json(
      respondSuccessWithData(
        "Object found",
        "Found PO Job with provided Machine Name",
        node.active_po_job
      )
    )
}

let save = async function (req, res) {
  let userId = req.user.id;
  let {po_number, target_quantity, material_number, target_completion_date} = req.body;

  let poRecord = (await new PoRecord({po_number}).fetch({require: false}));

  if (poRecord) {
    return res
      .status(422)
      .json(
        respondError("Duplicated Record", "PO Record with the same po number found", 422)
      )
  }

  // target_completion_date = moment(target_completion_date);
  // console.log(target_completion_date);

  poRecord = await new PoRecord({po_number, material_number, target_quantity, target_completion_date, user_id: userId, status: 'Created'}).save();

  poRecord = poRecord.toJSON();

  res.status(201)
    .json(
      respondSuccessWithData(
        "Object created",
        "Created new PO Record",
        poRecord,
        201
      )
    )
}

let end = async function(req, res) {
  let userId = req.user.id;
  let {id} = req.params;
  let poRecord = (await new PoRecord({id}).fetch({require: false}));

  if (!poRecord) {
    return res
      .status(404)
      .json(
        respondError("Not Found", "Unable to find PO with provided PO ID")
      )
  }

  if (poRecord.toJSON().status === 'Ended') {
    return res
      .status(422)
      .json(
        respondError("Unprocessable Entity", "Unable to end a PO Record that has been ended", 422)
      )
  }

  poRecord = (await new PoRecord({id}).save({status: 'Ended', ended_by: userId, ended_at: moment()}, {patch: true}));

  let poJobs = await PoJob.where({po_record_id: id}).fetch({require: false});

  if (poJobs) {
    await PoJob.where({po_record_id: id}).save({status: 'Ended', ended_by: userId, ended_at: moment()}, {patch: true});
  }

  poRecord = poRecord.toJSON();
  res.status(200)
    .json(
      respondSuccessWithData(
        "Ended PO",
        "Updated PO Record Status",
        poRecord
      )
    )
}

module.exports = {
  // index,
  latestPoByNodeNumber,
  showByPoNumber,
  save,
  end
}
