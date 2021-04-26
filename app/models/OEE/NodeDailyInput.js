const rootPath = './../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);
const Node = require('./../Node/Node');
const moment = require('moment');

const NodeDailyInput = bookshelf.model('NodeDailyInput', {
  hasTimestamps: true,
  tableName: 'oee_node_daily_inputs',
  initialize() {
    this.on('saved', async (model) => {
      // start time
      let { node_id, date} = model.attributes
      let startOfDay = moment(date).startOf('day')
      let endOfDay = moment(date).endOf('day')

      // set the OEE availabilities 'need_rework' = true
      await bookshelf.knex.raw(
        `
          UPDATE oee_performances
            SET need_rework = false
            WHERE node_id = ?
            AND start_time >= ?
            AND end_time <= ?
        `,
        [node_id, startOfDay, endOfDay]
      )
      // set the OEE performances 'need_rework' = true
      await bookshelf.knex.raw(
        `
          UPDATE oee_performances
            SET need_rework = false
            WHERE node_id = ?
            AND start_time >= ?
            AND end_time <= ?
        `,
        [node_id, startOfDay, endOfDay]
      )
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
