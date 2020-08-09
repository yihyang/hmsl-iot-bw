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
      value: _.meanBy(oeeValues, (o) => o.value),
      availability_value: _.meanBy(oeeValues, (o) => o.availability_value),
      performance_value: _.meanBy(oeeValues, (o) => o.performance_value),
      quality_value: _.meanBy(oeeValues, (o) => o.quality_value),
    }
  }

  res.json(result)
}

module.exports = {
  index,
  refresh
}
