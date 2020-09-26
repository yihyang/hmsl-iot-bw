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
  let formattedSixMonthAgo = moment().subtract(6,'months').startOf('month').format('YYYY-MM-DD');

  // get OEE since six months ago
  let oeeQuery =`
    SELECT EXTRACT(MONTH FROM start_time) AS month, avg(nullif(value, 'Nan'))
      FROM oee
      WHERE start_time >= ${formattedSixMonthAgo}
      GROUP BY month
  `;
  let oeeResult = await bookshelf.knex.raw(oeeQuery);

  console.log(oeeResult);

  let oeePerformanceQuery = `
  `;


}

module.exports = {
  index,
  refresh
}
