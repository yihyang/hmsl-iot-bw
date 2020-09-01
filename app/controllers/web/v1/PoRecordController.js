const rootPath = './../../../..'
let shortfall = require('./PoRecord/ShortfallController')
const PoRecord = require(`${rootPath}/app/models/PoRecord/PoRecord`)
const PoJob = require(`${rootPath}/app/models/PoRecord/PoJob`)
const {
  filterParams,
} = require(`${rootPath}/app/helpers/route`)

let index = async function(req, res) {
  let poRecords = (
    await new PoRecord().query(qb => {
      qb.orderBy('id', 'DESC')
    })
    .fetchAll({withRelated: 'user'})
  ).toJSON();

  res.render('web/v1/po-records/index', {poRecords})
}

let show = async function(req, res) {
  let {id} = req.params;
  let poRecord = (
    await new PoRecord({id})
    .fetch({require: false})
  ).toJSON();

  let poJobs = (await new PoJob({po_record_id: id}).query(qb => {
    qb.orderBy('id', 'DESC')
  }).fetchAll({withRelated: [
    'ended_by',
    'node',
    {
      'po_batches': function(qb) {
        qb.orderBy('created_at', 'DESC')
      }
    },
    'po_batches.user'
  ]})).toJSON()

  res.render('web/v1/po-records/show', {poRecord, poJobs})
}

let edit = async function(req, res) {
  let {id} = req.params;
  let poRecord = (
    await new PoRecord({id})
    .fetch({require: false})
  ).toJSON();
  res.render('web/v1/po-records/edit', {poRecord})
}

let update = async function(req, res) {
  let {id} = req.params;
  let params = filterParams(req.body, ['material_number', 'po_number', 'target_completion_date', 'target_quantity']);
  let poRecord =
    await new PoRecord({id})
    .save(params, {patch: true});

  res.redirect(`/po-records/${id}`)
}

module.exports = {
  index,
  show,
  shortfall,
  edit,
  update,
}
