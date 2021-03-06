const rootPath = './../../../../..'

const _ = require('lodash')
const moment = require('moment')

const Node = require(`${rootPath}/app/models/Node/Node`);
const OEE = require(`${rootPath}/app/models/OEE/OEE`);
const OEECapacity = require(`${rootPath}/app/models/OEE/OEECapacity`);
const OEEAvailability = require(`${rootPath}/app/models/OEE/OEEAvailability`);
const OEEPerformance = require(`${rootPath}/app/models/OEE/OEEPerformance`);
const OEEQuality = require(`${rootPath}/app/models/OEE/OEEQuality`);
const POJob = require(`${rootPath}/app/models/PoRecord/PoJob`)


let index = async function(req, res) {
  let nodes = (await new Node().fetchAll()).toJSON();
  res.render('web/v1/oee/details/index', { nodes })
}

let refresh = async function(req, res) {
  let { date, nodes } = req.query;

  let startOfDay = moment(date).startOf('day')
  let endOfDay = moment(date).endOf('day')

  if (!nodes) {
    nodes = _.map((await new Node().fetchAll()).toJSON(), 'id');
  }

  // oee
  let oee = (await new OEE().query((qb) => {
    qb.where('start_time', '>=', startOfDay)
      .where('end_time', '<=', endOfDay)
      .whereIn('node_id', nodes)
      .orderBy('node_id')
    })
    .fetchAll({withRelated: ['node']})).toJSON();

  // availability
  let capacity = (await new OEECapacity().query((qb) => {
    qb.where('start_time', '>=', startOfDay)
      .where('end_time', '<=', endOfDay)
      .whereIn('node_id', nodes)
      .orderBy('node_id')
    })
    .fetchAll({withRelated: ['node']})).toJSON();

  // availability
  let availability = (await new OEEAvailability().query((qb) => {
    qb.where('start_time', '>=', startOfDay)
      .where('end_time', '<=', endOfDay)
      .whereIn('node_id', nodes)
      .orderBy('node_id')
    })
    .fetchAll({withRelated: ['node']})).toJSON();

  // performance
  let performance = (await new OEEPerformance().query((qb) => {
    qb.where('start_time', '>=', startOfDay)
      .where('end_time', '<=', endOfDay)
      .whereIn('node_id', nodes)
      .orderBy('node_id')
    })
    .fetchAll({withRelated: ['node']})).toJSON();

  // quality
  let quality = (await new OEEQuality().query((qb) => {
    qb.where('start_time', '>=', startOfDay)
      .where('end_time', '<=', endOfDay)
      .whereIn('node_id', nodes)
      .orderBy('node_id')
    })
    .fetchAll({withRelated: ['node']})).toJSON();

  let jobs = (await new POJob().query((qb) => {
    qb.where('created_at', '>=', startOfDay)
      .where('created_at', '<=', endOfDay)
      .whereIn('node_id', nodes)
      .orderBy('node_id')
  })
  .fetchAll({withRelated: ['node', 'po_record']})).toJSON();

  jobs = _.groupBy(jobs, 'node.id')

  res.json({oee, availability, performance, quality, jobs, capacity})
}

module.exports = {
  index,
  refresh
}
