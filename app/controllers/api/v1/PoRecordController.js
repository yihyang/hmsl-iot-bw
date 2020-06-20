const rootPath = './../../../..'
const PoRecord = require(`${rootPath}/app/models/PoRecord/PoRecord`)
const PoJob = require(`${rootPath}/app/models/PoRecord/PoJob`)
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

let save = async function (req, res) {
  let userId = req.user.id;
  let {po_number, target_quantity, material_number} = req.body;

  let poRecord = (await new PoRecord({po_number, material_number}).fetch({require: false}));

  if (poRecord) {
    return res
      .status(422)
      .json(
        respondError("Duplicated Record", "PO Record with the same po number and material number found", 422)
      )
  }

  poRecord = await new PoRecord({po_number, material_number, target_quantity, user_id: userId, status: 'Created'}).save();

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

  if (poRecord.toJSON().status === 'Ende2d') {
    return res
      .status(422)
      .json(
        respondError("Unprocessable Entity", "Unable to end a PO Record that has been ended", 422)
      )
  }

  poRecord = (await new PoRecord({id}).save({status: 'Ended', ended_by: userId, ended_at: moment()}, {patch: true}));

  await PoJob.where({po_record_id: id}).save({status: 'Ended', ended_by: userId, ended_at: moment()}, {patch: true});

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
  showByPoNumber,
  save,
  end
}
