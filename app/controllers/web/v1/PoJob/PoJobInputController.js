const rootPath = './../../../../..'
const PoJobInput = require(`${rootPath}/app/models/PoRecord/PoJob/PoJobInput`)
const moment = require('moment')

let destroy = async (req, res) => {
  let { id, inputId } = req.params;
  let jobInput = await getJobInput(inputId)

  if (!jobInput) {
    req.flash('error', `Unable to find PO Job INput with ID - ${inputId}`)
    return res.redirect(`/po-jobs/${id}`)
  }

  jobInput.set('deleted_at', moment())
  jobInput.save()

  req.flash('success', `Successfully deleted PO Job INput with ID - ${inputId}`)
  res.redirect(`/po-jobs/${id}`)
}
let edit = async (req, res) => {
  let { id, inputId } = req.params;
  let jobInput = await getJobInput(req.params.inputId)
  jobInput = jobInput.toJSON()

  res.render('web/v1/po-jobs/po-job-inputs/edit', {jobInput})
}

let update = async (req, res) => {
  let { id, inputId } = req.params;
  let { quantity } = req.body
  let jobInput = await getJobInput(inputId)

  if (!jobInput) {
    req.flash('error', `Unable to find PO Job INput with ID - ${inputId}`)
    return res.redirect(`/po-jobs/${id}`)
  }

  jobInput.set('quantity', quantity)
  jobInput.save()

  res.redirect(`/po-jobs/${id}`)
}

let getJobInput = async (id) => {
  return await new PoJobInput().query(qb => { qb.where('id', id) }).fetch()
}

module.exports = {
  edit,
  update,
  destroy
}
