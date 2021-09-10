const rootPath = './../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);
const Node = require('./../Node/Node');
const moment = require('moment');
const { addRerunDailyTimeInputOeeJob } = require(`${rootPath}/app/queues/oee_rework`)

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
          (node_id, date)\
          SELECT nodes.id, ? AS date\
          FROM nodes\
          WHERE nodes.id NOT IN\
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
