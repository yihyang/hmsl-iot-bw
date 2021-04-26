const rootPath = './../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);
const Gwo = require('./Gwo');
const GwoItemSparePartUsage = require('./GwoItemSparePartUsage');
const Node = require('./../Node/Node');
const moment = require('moment')

// General Work Order
var GwoItem = bookshelf.Model.extend({
  hasTimestamps: true,
  tableName: 'gwo_items',
  initialize() {
    this.on('saved', async (model, attrs) => {
      let gwo  = await model.gwo().fetch()
      // set the OEE availabilities 'need_rework' = true
      // set the OEE performances 'need_rework' = true

      let { start_time, end_time} = gwo.attributes
      console.log(start_time, end_time)
      let node_id = model.attributes.node_id
      let startOfDay = moment(start_time).startOf('day')
      let endOfDay = moment(end_time).endOf('day')

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
    })
  },
  gwo() {
    return this.belongsTo(require('./Gwo'));
  },
  node() {
    return this.belongsTo(Node);
  },
  spare_part_usages() {
    return this.hasMany(GwoItemSparePartUsage);
  }
});

module.exports = GwoItem;
