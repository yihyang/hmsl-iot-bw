const rootPath = './../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);
const Node = require('./../Node/Node');
const moment = require('moment');
const {
  addRerunDailyTimeInputOeeJob
} = require(`${rootPath}/app/helpers/queue_helper`)

const NodeDailyInput = bookshelf.model('NodeDailyInput', {
  hasTimestamps: true,
  tableName: 'oee_node_daily_inputs',
  initialize() {
    this.on('saved', async (model) => {
      let { node_id, date } = model.attributes

      await addRerunDailyTimeInputOeeJob(node_id, date)
    })
  },
  node() {
    return this.belongsTo(NodeDailyInput)
  },
}, {
  insertDefaultValueForDate: function(date) {
    return bookshelf.knex.raw(
      '\
        INSERT INTO oee_node_daily_inputs\
          (node_id, am_availability, pm_availability, am_capacity, pm_capacity, date)\
          SELECT node_id, am_availability, pm_availability, am_capacity, pm_capacity, ? AS date\
          FROM oee_node_default_values\
          WHERE node_id NOT IN\
          (\
            SELECT node_id\
            FROM oee_node_daily_inputs\
            WHERE date = ?\
          );\
      ',
      [date, date]
    );
  }
})

module.exports = NodeDailyInput;
