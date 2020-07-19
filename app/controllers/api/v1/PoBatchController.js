const rootPath = './../../../..'
const PoJob = require(`${rootPath}/app/models/PoRecord/PoJob`)
const PoBatch = require(`${rootPath}/app/models/PoRecord/PoBatch`)
const {respondError, respondSuccessWithData} = require(`${rootPath}/app/helpers/response`)

let save = async function (req, res) {
  let userId = req.user.id;
  let {po_job_id, output_quantity} = req.body;
  output_quantity = output_quantity / 1000; // adjust from gram to kg

  // validate po_job exists
  let poJob = (await new PoJob({id: po_job_id}).fetch({require: false}))

  if (!poJob) {
    return res
      .status(404)
      .json(
        respondError("Job not found", "Unable to find job with the id", 404)
      )
  }

  let poBatch = await new PoBatch({po_job_id, output_quantity, user_id: userId, status: 'Created'}).save();

  poBatch = poBatch.toJSON();

  res.status(201)
    .json(
      respondSuccessWithData(
        "Object created",
        "Created new PO Batch",
        poBatch,
        201
      )
    )
}

module.exports = {
  save
}
