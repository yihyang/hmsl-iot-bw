const rootPath = './../../../..'
const PoJob = require(`${rootPath}/app/models/PoRecord/PoJob`)
const PoJobInput = require(`${rootPath}/app/models/PoRecord/PoJob/PoJobInput`)
const {respondError, respondSuccessWithData} = require(`${rootPath}/app/helpers/response`)

let save = async function (req, res) {
  let userId = req.user.id;
  let {po_job_id, quantity} = req.body;

  // create po job
  let poJob = (await new PoJob({id: po_job_id}).fetch({require: false}))

  if (!poJob) {
    return res
      .status(404)
      .json(
        respondError("Unable to find PO Job", "Unable to find PO Job with the provided ID", 422)
      )
  }

  poJobInput = await new PoJobInput({po_job_id, quantity, user_id: userId}).save();

  poJobInput = poJobInput.toJSON();

  res.status(201)
    .json(
      respondSuccessWithData(
        "Object created",
        "Created new PO Job Input",
        poJobInput,
        201
      )
    )
}

module.exports = {
  save
}
