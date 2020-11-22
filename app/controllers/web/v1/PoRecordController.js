const rootPath = './../../../..'
let shortfall = require('./PoRecord/ShortfallController')
let jobs = require('./PoRecord/PoJobController')
let poInputs = require('./PoRecord/PoJobInputController')
const PoRecord = require(`${rootPath}/app/models/PoRecord/PoRecord`)
const PoJob = require(`${rootPath}/app/models/PoRecord/PoJob`)
const {
  filterParams,
  getPaginationAttributes,
} = require(`${rootPath}/app/helpers/route`)

let index = async function(req, res) {
  let paginationAttribute = getPaginationAttributes(req);
  let poRecords = (
    await new PoRecord().query(qb => {
      qb.orderBy('id', 'DESC')
        .offset(paginationAttribute.page_offset)
        .limit(paginationAttribute.items_per_page)
    })
    .fetchAll({withRelated: 'user'})
  ).toJSON();

  let totalCount = await new PoRecord().count('*');
  let total_page = Math.ceil(parseInt(totalCount) / paginationAttribute.items_per_page)

  res.render('web/v1/po-records/index', {poRecords, ...paginationAttribute, total_page})
}

let add = async function(req, res) {
  res.render('web/v1/po-records/add')
}

let save = async function(req, res) {
  let userId = req.user.id;
  let {po_number, target_quantity, material_number, target_completion_date} = req.body;

  let poRecord = (await new PoRecord({po_number}).fetch({require: false}));

  if (poRecord) {
    req.flash('error', "PO Record with the same PO Number exists")
    return res.redirect('/po-records')
  }

  poRecord = await new PoRecord({po_number, material_number, target_quantity, target_completion_date, user_id: userId, status: 'Created'}).save()

  poRecord = poRecord.toJSON()

  res.redirect('/po-records')
}

let show = async function(req, res) {
  let {id} = req.params;
  let poRecord = (
    await new PoRecord({id})
    .fetch({
      require: false,
    })
    .then(async (collection) => {
      let result = collection.toJSON();
      return result;
    })
  );

  let poJobs = (await new PoJob().query(qb => {
    qb
      .where('po_record_id', id)
      .orderBy('id', 'DESC')
      .limit(10)
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
  add,
  save,
  show,
  shortfall,
  jobs,
  edit,
  update,
  poInputs,
}
