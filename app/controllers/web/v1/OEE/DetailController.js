const _ = require('lodash')
const moment = require('moment')

const rootPath = './../../../../..'

const Node = require(`${rootPath}/app/models/Node/Node`);
const OEE = require(`${rootPath}/app/models/OEE/OEE`);
const OEEAvailability = require(`${rootPath}/app/models/OEE/OEEAvailability`);
const OEEPerformance = require(`${rootPath}/app/models/OEE/OEEPerformance`);
const OEEQuality = require(`${rootPath}/app/models/OEE/OEEQuality`);


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

  res.json({oee, availability, performance, quality})
}

module.exports = {
  index,
  refresh
}
