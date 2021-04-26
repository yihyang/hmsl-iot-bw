/**
 *
 * Separate into another controller into order to avoid too deep level of nesting
 * e.g. po-records/1/po-jobs/2/po-inputs/3/edit
 *
 */
const rootPath = '../../../..'
const PoJob = require(`${rootPath}/app/models/PoRecord/PoJob`)

const poBatches = require(`${rootPath}/app/controllers/web/v1/PoJob/PoBatchController`)
const poJobInputs = require(`${rootPath}/app/controllers/web/v1/PoJob/PoJobInputController`)

let show = async (req, res) => {
  let { id } = req.params
  let poJob = await new PoJob().query(qb => qb.where('id', id)).fetch({
    require: false,
    withRelated: [
      'po_record',
      {
        'po_job_inputs': qb => {
          qb.whereNull('po_job_inputs.deleted_at')
        }
      },
      'po_job_inputs.user',
      {
        'po_batches': qb => {
          qb.whereNull('po_batches.deleted_at')
        }
      },
      'po_batches.user',
      'node',
      'user'
    ]
  })

  if (!poJob) {
    req.flash('error', `Unable to find PO Job with ID - ${id}`)
    return res.redirect(`/po-records/${id}`)
  }

  poJob = poJob.toJSON()

  res.render('web/v1/po-jobs/show', { poJob })
}

module.exports = {
  show,
  poBatches,
  poJobInputs
}
