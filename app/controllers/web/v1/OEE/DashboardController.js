const moment = require('moment')
const _ = require('lodash')

const rootPath = './../../../../..'
const Node = require(`${rootPath}/app/models/Node/Node`);
const OEE = require(`${rootPath}/app/models/OEE/OEE`);
const NodeDailyInput = require(`${rootPath}/app/models/OEE/NodeDailyInput`);
const bookshelf = require(`${rootPath}/config/bookshelf`);

let index = async function(req, res) {
  res.render('web/v1/oee/dashboard/index', {})
}

let refresh = async function(req, res) {
  let {startDate, endDate} = req.query

  let startTime = moment(startDate).startOf('day');
  let endTime = moment(endDate).endOf('day');

  // set default values
  let result = {
    value: 0,
    availability_value: 0,
    quality_value: 0,
    performance_value: 0,
  }

  let oeeValues = await new OEE().query((qb) => {
      qb.where('start_time', '>=', startTime)
        .where('end_time', '<=', endTime)
    })
    .fetchAll({require: false});

  if(oeeValues) {
    oeeValues = oeeValues.toJSON();
    result = {
      value: _.meanBy(oeeValues, (o) => o.value || 0),
      availability_value: _.meanBy(oeeValues, (o) => o.availability_value || 0),
      performance_value: _.meanBy(oeeValues, (o) => o.performance_value || 0),
      quality_value: _.meanBy(oeeValues, (o) => o.quality_value || 0),
    }
  }

  res.json(result)
}

let historyRefresh = async function(req, res) {
  let today = moment();
  let sixMonthAgo = moment().subtract(6,'months').startOf('month');
  let formattedSixMonthAgo = sixMonthAgo.format('YYYY-MM-DD');

  /*******
   * OEE *
   *******/
  // get OEE since six months ago
  let oeeQuery =`
    SELECT EXTRACT(MONTH FROM start_time) AS month, avg(nullif(value, 'NaN')) AS value
      FROM oee
      WHERE start_time >= '${formattedSixMonthAgo}'
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
    oeeValue.push(oeeResult[digitMonth] || 0)
    oeeDefaultValue.push(0.7)

    oeeSixMonthAgo.add(1, 'month')
  }
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
  outputResult = _.reduce(outputResult, function(carry, item) { carry[item.month] = item.value; return carry; }, {});
  let outputLabel = [];
  let outputValue = [];
  let outputDefaultValue = [];
  let outputSixMonthAgo = sixMonthAgo.clone()
  while(outputSixMonthAgo.isBefore(today)) {
    let digitMonth = parseInt(oeeSixMonthAgo.format('MM'));
    let labelMonth = oeeSixMonthAgo.format('MMM');

    outputLabel.push(labelMonth)
    outputValue.push(outputResult[digitMonth] || 0)
    outputDefaultValue.push(100)

    outputSixMonthAgo.add(1, 'month')
  }

  let output = { label: outputLabel, value: outputValue, default: outputDefaultValue }

  res.json({oee, output})
}

module.exports = {
  index,
  refresh,
  historyRefresh
}
