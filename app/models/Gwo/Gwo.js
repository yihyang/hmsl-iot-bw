const rootPath = './../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);
const User = require(`${rootPath}/app/models/Account/User`);
const GwoReason = require('./GwoReason')
const GwoItem = require('./GwoItem')
const moment = require('moment')
const _ = require('lodash')

// General Work Order
var Gwo = bookshelf.Model.extend({
  hasTimestamps: true,
  tableName: 'gwo',
  initialize() {
    this.on('saving', (model, attrs) => {
      if (attrs.start_time && attrs.end_time) {
        // set duration
        attrs['duration'] = moment(attrs.end_time).diff(moment(attrs.start_time)) / 1000;
      }
    })
    this.on('saved', async (model, attrs) => {
    })
  },
  gwo_items() {
    return this.hasMany(GwoItem)
  },
  reason() {
    return this.belongsTo(GwoReason)
  },
  user() {
    return this.belongsTo(User)
  }
}, {
  async getOverlappedGWODuration(nodeId, startTime, endTime) {
    let overlappedGwo = await (Gwo.query((qb) => {
      qb.join('gwo_items', 'gwo.id', 'gwo_items.gwo_id')
        .where('gwo_items.node_id', nodeId)
        .where(qb => {
          qb
            .where(qb => {
              // between start and end time
              qb.where('start_time', '>=', startTime)
                .where('end_time', '<=', endTime)
            })
            .orWhere(qb => {
              // where outside start and end time
              qb.where('start_time', '<=', startTime)
                  .where('end_time', '>=', endTime)
            })
            .orWhere(qb => {
              // where start before start time
              // and ended between start and end time
              qb.where('start_time', '<=', startTime)
                  .where('end_time', '>=', startTime)
                  .where('end_time', '<=', endTime)
            })
            .orWhere(qb => {
              // where start between start and end time
              // and ended after end time
              qb.where('start_time', '>=', startTime)
                  .where('start_time', '<=', endTime)
                  .where('end_time', '>=', endTime)
            })
        })
    }).fetchAll({require: false}))

    if (!overlappedGwo) {
      return 0
    }
    console.log(overlappedGwo.toJSON())

    return _.map(overlappedGwo.toJSON(), (item) => {
      let gwoStartTime = moment(item.start_time).isBefore(startTime) ? startTime : moment(item.start_time)
      let gwoEndTime = moment(item.end_time).isAfter(endTime) ? endTime : moment(item.end_time)

      return gwoEndTime.diff(gwoStartTime) / 1000
    })
  }
});

module.exports = Gwo;
