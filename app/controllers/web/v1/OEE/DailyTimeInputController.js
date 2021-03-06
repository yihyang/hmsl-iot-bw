const rootPath = './../../../../..'
const Node = require(`${rootPath}/app/models/Node/Node`);
const NodeDailyInput = require(`${rootPath}/app/models/OEE/NodeDailyInput`);
const moment = require('moment');
const bookshelf = require(`${rootPath}/config/bookshelf`);
const { isBW } = require(`${rootPath}/config/app-settings`)

let index = async function(req, res) {
  let nodes = (await new Node().fetchAll()).toJSON();

  let defaultMaxValue = isBW() ? 10 : 12;

  res.render('web/v1/oee/daily-time-inputs/index', {nodes, defaultMaxValue})
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
  let scheduleName = schedule + "_availability";
  let {value, date} = req.body;

  let DEFAULT_MAX_AVAILABILITY = 12;
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
  updateValues[scheduleName] = value;
  updateValues['date'] = date;

  if (defaultValue) {
    await defaultValue.save(updateValues, {patch: true});
  } else {
    updateValues.node_id = nodeId;
    await new NodeDailyInput(updateValues).save();
  }

  console.log(node)

  res.json({'message': 'Successfully updated ' + schedule + ' for Machine ' + node.name + ' to ' + value});
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

module.exports = {
  index,
  fetchByDate,
  update,
  setDefaultValues
}
