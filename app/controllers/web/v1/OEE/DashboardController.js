const moment = require('moment')
const _ = require('lodash')

const rootPath = './../../../../..'
const Node = require(`${rootPath}/app/models/Node/Node`);
const NodeGroup = require(`${rootPath}/app/models/Node/NodeGroup`);
const OEE = require(`${rootPath}/app/models/OEE/OEE`);
const GWO = require(`${rootPath}/app/models/Gwo/Gwo`);
const NodeDailyInput = require(`${rootPath}/app/models/OEE/NodeDailyInput`);
const bookshelf = require(`${rootPath}/config/bookshelf`);



const ROUND_UP_SIZE = 3

let index = async function(req, res) {
  let nodes = (await new Node().query((qb) => {
    qb.orderBy('name')
  }).fetchAll()).toJSON()
  res.render('web/v1/oee/dashboard/index', {nodes})
}

let refresh = async function(req, res) {
  let {startDate, endDate, nodes} = req.query

  let startTime = moment(startDate).startOf('day');
  let endTime = moment(endDate).endOf('day');

  // set default values
  let result = {
    value: 0,
    availability_value: 0,
    quality_value: 0,
    performance_value: 0,
    capacity_value: 0,
    oee2: 0,
  }

  let oeeValues = await new OEE().query((qb) => {
      qb.where('start_time', '>=', startTime)
        .where('end_time', '<=', endTime)

      if (nodes) {
        qb.where('node_id', 'IN', nodes)
      }
    })
    .fetchAll({require: false});

  if(oeeValues) {
    oeeValues = oeeValues.toJSON();
    result = {
      oee2: _.meanBy(oeeValues, (o) => o.oee2 || 0),
      capacity_value: _.meanBy(oeeValues, (o) => o.capacity_value || 0),
      value: _.meanBy(oeeValues, (o) => o.value || 0),
      availability_value: _.meanBy(oeeValues, (o) => o.availability_value || 0),
      performance_value: _.meanBy(oeeValues, (o) => o.performance_value || 0),
      quality_value: _.meanBy(oeeValues, (o) => o.quality_value || 0),
    }
  }

  // NOTE: set to null as the HMSL has not issued PO
  result['oee2'] = null
  result['capacity_value'] = null

  res.json(result)
}

let reasonRefresh = async function(req, res) {
  let {startDate, endDate, nodeGroups} = req.query

  let startTime = moment(startDate).startOf('day');
  let endTime = moment(endDate).endOf('day');
  let formattedStartDate = startTime.format('YYYY-MM-DD');
  let formattedEndDate = endTime.format('YYYY-MM-DD');

  let nodeIds = await getNodeIds(nodeGroups)

  let reasonQuery = `
    SELECT gwo_reasons.name AS reason, count(*) AS count
      FROM gwo
      JOIN gwo_reasons ON gwo.gwo_reason_id = gwo_reasons.id
      JOIN gwo_items ON gwo.id = gwo_items.gwo_id
      WHERE gwo.created_at >= ?
      AND gwo.created_at <= ?`;

    if (nodeIds) {
      reasonQuery += `
        AND gwo_items.node_id  IN (${nodeIds.join(',')})
      `
    }

    reasonQuery += `
      GROUP BY gwo_reasons.name
      ORDER BY count(*);
  `;

  let reasonResult = (await bookshelf.knex.raw(reasonQuery, [formattedStartDate, formattedEndDate])).rows;

  let reasonLabel = [];
  let reasonValue = [];

  reasonResult.forEach(function (item) {
    reasonLabel.push(item.reason)
    reasonValue.push(item.count)
  })

  let reasons = {
    labels: reasonLabel,
    values: reasonValue,
  }

  res.json({reasons})

}

let historyRefresh = async function(req, res) {
  let {nodeGroups} = req.query
  let today = moment();
  let sixMonthAgo = moment().subtract(6,'months').startOf('month');
  let formattedSixMonthAgo = sixMonthAgo.format('YYYY-MM-DD');

  let nodeIds = await getNodeIds(nodeGroups)

  /*******
   * OEE *
   *******/
  // get OEE since six months ago
  let oeeQuery =`
    SELECT EXTRACT(MONTH FROM start_time) AS month, avg(nullif(value, 'NaN')) AS value
      FROM oee
      WHERE start_time >= '${formattedSixMonthAgo}'`

  if (nodeIds) {
    reasonQuery += `
      AND oee.node_id  IN (${nodeIds.join(',')})
    `
  }

  oeeQuery += `
      GROUP BY month
  `;
  let oeeResult = await bookshelf.knex.raw(oeeQuery);
  oeeResult = oeeResult.rows;

  // map result
  oeeResult = _.reduce(oeeResult, function(carry, item) { carry[item.month] = item.value; return carry; }, {});
  let oeeLabel = [];
  let oeeValue = [];
  let oeeDefaultValue = [];
  let oeeSixMonthAgo = sixMonthAgo.clone()
  while(oeeSixMonthAgo.isBefore(today)) {
    let digitMonth = parseInt(oeeSixMonthAgo.format('MM'));
    let labelMonth = oeeSixMonthAgo.format('MMM');

    oeeLabel.push(labelMonth)
    oeeValue.push((oeeResult[digitMonth] || 0) * 100)
    oeeDefaultValue.push(70)

    oeeSixMonthAgo.add(1, 'month')
  }
  // v2
  // let oeeValues = await new OEE().query((qb) => {
  //     qb.where('start_time', '>=', sixMonthAgo)
  //       .where('end_time', '<=', today)

  //     if (nodeIds) {
  //       qb.where('node_id', 'IN', nodes)
  //     }
  //   })
  //   .fetchAll({require: false})
  // oeeValues = oeeValues.toJSON()

  // // accumulate values
  // let oeeResult = _.reduce(oeeValues, (carry, item) => {
  //   let month = item.format('MM')
  //   if (!carry[month]) {
  //     carry[month] = []
  //   }
  //   carry[month].push(item.value)
  // }, {})

  // let oeeLabel = []
  // let oeeValue = []
  // let oeeDefaultValue = []
  // let oeeSixMonthAgo = sixMonthAgo.clone()
  // while(oeeSixMonthAgo.isBefore(today)) {
  //   let digitMonth = parseInt(oeeSixMonthAgo.format('MM'))
  //   let labelMonth = oeeSixMonthAgo.format('MMM')

  //   oeeLabel.push(labelMonth)
  //   let monthlyAverageValue = _.meanBy(oeeResult[digitMonth], (o) => o || 0)
  //   oeeValue.push((monthlyAverageValue || 0) * 100)
  //   oeeDefaultValue.push(70)

  //   oeeSixMonthAgo.add(1, 'month')
  // }


  let oee = { label: oeeLabel, value: oeeValue, default: oeeDefaultValue }


  /**********
   * Output *
   **********/
  let outputQuery = `
    SELECT EXTRACT(MONTH FROM created_at) AS month, avg(nullif(produced_quantity, 'NaN')) AS value
      FROM po_records
      WHERE created_at >= '${formattedSixMonthAgo}'
      GROUP BY month
  `;
  let outputQueryResult = await bookshelf.knex.raw(outputQuery);
  let outputResult = outputQueryResult.rows;

  // map result
  outputResult = _.reduce(outputResult, function(carry, item) { carry[item.month] = _.round(item.value, ROUND_UP_SIZE); return carry; }, {});
  let outputLabel = [];
  let outputValue = [];
  let outputDefaultValue = [];
  let outputSixMonthAgo = sixMonthAgo.clone()
  while(outputSixMonthAgo.isBefore(today)) {
    let digitMonth = parseInt(outputSixMonthAgo.format('MM'));
    let labelMonth = outputSixMonthAgo.format('MMM');

    outputLabel.push(labelMonth)
    outputValue.push(outputResult[digitMonth] || 0)
    outputDefaultValue.push(130)

    outputSixMonthAgo.add(1, 'month')
  }

  let output = { label: outputLabel, value: outputValue, default: outputDefaultValue }

  res.json({oee, output})
}

/**
 * Gets the node identifiers.
 *
 * @param      {array}  nodeGroupIds  The node group identifiers
 * @return     {array}  The node identifiers.
 */
async function getNodeIds(nodeGroupIds) {
  if (!nodeGroupIds) {
    return null;
  }

  let nodeGroups = await new NodeGroup().query((qb) => {
    qb.where('id', 'IN', nodeGroupIds)
  }).fetchAll({
    withRelated: ['nodes']
  })
  nodeGroups = nodeGroups.toJSON()

  return _.flatten(
    _.map(nodeGroups, (group) => {
      return _.map(group.nodes, (node) => {
        return node.id
      })
    })
  )
}

module.exports = {
  index,
  refresh,
  reasonRefresh,
  historyRefresh,
}
