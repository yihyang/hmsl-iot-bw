const rootPath = './../../../../..'
const Node = require(`${rootPath}/app/models/Node/Node`);
const NodeDailyInput = require(`${rootPath}/app/models/OEE/NodeDailyInput`);
const moment = require('moment');
const bookshelf = require(`${rootPath}/config/bookshelf`);
const { getSiteName } = require(`${rootPath}/config/app-settings`)
const { getDefaultMaxValue, getDefaultButtonValue } = require(`${rootPath}/app/helpers/oee/daily_time_input`)
const capacityReasons = require(rootPath + '/app/controllers/web/v1/OEE/DailyTimeInput/CapacityReasonController')
const CapacityReason = require(`${rootPath}/app/models/OEE/DailyTimeInput/CapacityReason`)

let index = async function(req, res) {
  let nodes = (await new Node().fetchAll()).toJSON();

  let defaultMaxValue = getDefaultMaxValue(getSiteName());
  let defaultButtonValue = getDefaultButtonValue(getSiteName());

  let reasons = await new CapacityReason().fetchAll()
  reasons = reasons.toJSON()

  res.render('web/v1/oee/daily-time-inputs/index', {nodes, defaultMaxValue, defaultButtonValue, reasons})
}

let fetchByDate = async function(req, res) {
  let {date} = req.query;
  date = moment(date, 'DD/MM/YYYY');

  // insert default values
  await NodeDailyInput.insertDefaultValueForDate(date);

  let queryDate = date.format('YYYY-MM-DD');

  let nodeDailyInput = await new NodeDailyInput()
    .query(function(qb) {
      qb.where('date', queryDate)
    }).fetchAll();

  nodeDailyInput = nodeDailyInput.toJSON();

  res.json(nodeDailyInput);
}

/**
 * Update
 *
 * @param      {<type>}  req     The request
 * @param      {<type>}  res     The resource
 */
let update = async function(req, res) {
  let {nodeId, schedule} = req.params;
  // let scheduleName = schedule + "_availability";
  let {value, date, type} = req.body;

  let DEFAULT_MAX_AVAILABILITY = getDefaultMaxValue(getSiteName());;
  if (value > DEFAULT_MAX_AVAILABILITY) {
    return res.status(422).json({
      'errors': [
        { 'message': 'Availability cannot be greater than ' +  DEFAULT_MAX_AVAILABILITY + ' hours',
          'corrected_value': DEFAULT_MAX_AVAILABILITY }
      ]
    });
  }

  date = moment(date, 'DD/MM/YYYY');
  date = date.format('YYYY-MM-DD');

  let node = (await new Node({id: nodeId}).fetch({require: false})).toJSON();

  let defaultValue = await new NodeDailyInput({node_id: nodeId})
    .query(function(qb) {
      qb.where('date', date)
    }).fetch({require: false});

  let updateValues = { date }
  updateValues[type] = value;
  updateValues['date'] = date;

  let label = ''
  switch(type) {
    case 'am_availability': label = 'AM Availability'; break;
    case 'pm_availability': label = 'PM Availability'; break;
    case 'am_capacity': label = 'AM Capacity'; break;
    case 'pm_capacity': label = 'AM Capacity'; break;
    case 'am_capacity_reason_id': label = 'AM Capacity Reason'; break;
    case 'pm_capacity_reason_id': label = 'PM Capacity Reason'; break;
  }

  if (defaultValue) {
    await defaultValue.save(updateValues, {patch: true});
  } else {
    updateValues.node_id = nodeId;
    await new NodeDailyInput(updateValues).save();
  }

  res.json({'message': 'Successfully updated ' + label + ' for Machine ' + node.name + ' to ' + value});
}

/**
 * Sets the default values.
 *
 * @param      {<type>}  req     The new value
 * @param      {<type>}  res     The new value
 */
let setDefaultValues = async (req, res) => {
  // set default values for area
  let { date, value } = req.body;

  date = moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD');

  let updateValues = {};
  updateValues['am_availability'] = value;
  updateValues['pm_availability'] = value;

  // update existing values
  await bookshelf.knex('oee_node_daily_inputs')
    .update(
      updateValues
    )
    .where('date', date)
    .whereIn('node_id', function() {
      this
        .select('id')
        .from('nodes')
    });

  // insert new record if not exists
  await bookshelf.knex.raw(
    `
      INSERT INTO oee_node_daily_inputs
      (node_id, am_availability, pm_availability, date)
      SELECT id, ?, ?, ?
      FROM nodes
      WHERE id NOT IN
      (
        SELECT node_id
        FROM oee_node_daily_inputs
        WHERE date = ?
      )
    `,
    [value, value, date,  date]
  );

  res.json({message: 'Successfully set all availability to ' + value +'.'});
};

/**
 * Sets the default values.
 *
 * @param      {<type>}  req     The new value
 * @param      {<type>}  res     The new value
 */
let setDefaultAvailabilities = async (req, res) => {
  // set default values for area
  let { area, date, value, type } = req.body;

  let amField = 'am_availability'
  let pmField = 'pm_availability'
  if (type === 'capacity') {
    amField = 'am_capacity'
    pmField = 'pm_capacity'
  }

  date = moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD');

  let updateValues = {};
  updateValues[amField] = value;
  updateValues[pmField] = value;

  // update existing values
  await bookshelf.knex('oee_node_daily_inputs')
    .update(
      updateValues
    )
    .where('date', date)
    // .whereIn('node_id', function() {
    //   this
    //     .select('id')
    //     .from('nodes')
    //     .where({'area': area})
    // });

  // insert new record if not exists
  await bookshelf.knex.raw(
    `
      INSERT INTO oee_node_daily_inputs
      (node_id, ${amField}, ${pmField}, date)
      SELECT id, ?, ?, ?
      FROM nodes
      WHERE id NOT IN
      (
        SELECT node_id
        FROM oee_node_daily_inputs
        WHERE date = ?
      )
    `,
    [value, value, date, date]
  );

  res.json({message: 'Successfully set all ' + type + ' availability to ' + value +'.'});
};

let setDefaultCapacityReasons = async (req, res) => {
  // set default values for area
  let { area, date, value, label } = req.body;

  date = moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD');

  // set null values
  if (value == 'null') {
    value = null
  }

  let updateValues = {};
  updateValues['am_capacity_reason_id'] = value;
  updateValues['pm_capacity_reason_id'] = value;

  // update existing values
  await bookshelf.knex('oee_node_daily_inputs')
    .update(
      updateValues
    )
    .where('date', date)
    // .whereIn('node_id', function() {
    //   this
    //     .select('id')
    //     .from('nodes')
    //     .where({'area': area})
    // });

  // insert new record if not exists
  await bookshelf.knex.raw(
    `
      INSERT INTO oee_node_daily_inputs
      (node_id, am_capacity_reason_id, pm_capacity_reason_id, date)
      SELECT id, ?, ?, ?
      FROM nodes
      WHERE
      id NOT IN
      (
        SELECT node_id
        FROM oee_node_daily_inputs
        WHERE date = ?
      )
    `,
    [value, value, date, date]
  );

  res.json({message: 'Successfully set all reason to ' + label +'.'});
}

module.exports = {
  index,
  fetchByDate,
  update,
  setDefaultValues,
  setDefaultCapacityReasons,
  setDefaultAvailabilities,
  capacityReasons,
}
