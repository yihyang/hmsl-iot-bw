const rootPath = './../../../../..';
const PoRecord = require(`${rootPath}/app/models/PoRecord/PoRecord`)
const PoJob = require(`${rootPath}/app/models/PoRecord/PoJob`)

let add = async (req, res) => {
  let {id} = req.params

  let poRecord = (await new PoRecord({id}).fetch({require: false}))

  if (!poRecord) {
    req.flash('error', 'Unable to find PO Record')
    return res.redirect(`/po-records/${id}`)
  }

  res.render('web/v1/po-records/po-inputs/add', {id})
}

let save = async (req, res) => {
  let userId = req.user.id;
  let {po_job_id, quantity} = req.body;

  if (!poRecord) {
    res.flash('error', 'Unable to find PO Record')
    return res.redirect(`/po-records/${id}`)
  }


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
        "Inserted material record",
        poJobInput,
        201
      )
    )

}

module.exports  ={
  add,
  save
}
