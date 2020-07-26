const rootPath = './../../../..'
let shortfall = require('./PoRecord/ShortfallController')
const PoRecord = require(`${rootPath}/app/models/PoRecord/PoRecord`)
const PoJob = require(`${rootPath}/app/models/PoRecord/PoJob`)

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
  }).fetchAll({withRelated: ['ended_by', 'po_batches.user']})).toJSON()

  res.render('web/v1/po-records/show', {poRecord, poJobs})
}

module.exports = {
  index,
  show,
  shortfall
}
