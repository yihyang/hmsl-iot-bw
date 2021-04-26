const rootPath = './../../../../..'
const PoBatch = require(`${rootPath}/app/models/PoRecord/PoBatch`)
const moment = require('moment')

let destroy = async (req, res) => {
  let { id, batchId } = req.params;
  let batch = await getBatch(batchId)

  if (!batch) {
    req.flash('error', `Unable to find Job Input with ID - ${batchId}`)
    return res.redirect(`/po-jobs/${id}`)
  }

  batch.set('deleted_at', moment())
  batch.save()

  req.flash('success', `Successfully deleted PO Job Input with ID - ${batchId}`)
  return res.redirect(`/po-jobs/${id}`)
}

let edit = async (req, res) => {
  let { id, batchId } = req.params;
  let batch = await getBatch(batchId)
  batch = batch.toJSON()

  res.render('web/v1/po-jobs/po-batches/edit', {batch})
}

let update = async (req, res) => {
  let { id, batchId } = req.params;
  let { output_quantity } = req.body
  let batch = await getBatch(batchId)

  if (!batch) {
    req.flash('error', `Unable to find PO Job Input with ID - ${batchId}`)
    return res.redirect(`/po-jobs/${id}`)
  }

  batch.set('output_quantity', output_quantity)
  batch.save()

  res.redirect(`/po-jobs/${id}`)
}

let getBatch = async (id) => {
  return await new PoBatch().query(qb => { qb.where('id', id) }).fetch()
}

module.exports = {
  edit,
  update,
  destroy,
}
