const rootPath = './../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);
const User = require(`${rootPath}/app/models/Account/User`);
const GwoReason = require('./GwoReason')
const GwoItem = require('./GwoItem')
const moment = require('moment')
const _ = require('lodash')

const {
  asyncForEach
} = require(`${rootPath}/app/helpers/loop`)
const {
  getDateRange
} = require(`${rootPath}/app/helpers/date_helper`)
const {
  addRerunGwoOeeJob
} = require(`${rootPath}/app/helpers/queue_helper`)

// General Work Order
var Gwo = bookshelf.Model.extend({
  hasTimestamps: true,
  tableName: 'gwo',
  soft: ['deleted_at'], // soft delete
  initialize() {
    this.on('saving', (model, attrs) => {
      let dateFormat = "YYYY-MM-DD hh:mm:ss a"
      if (attrs.start_time && attrs.end_time) {
        // set duration
        attrs['duration'] = moment(attrs.end_time, dateFormat).diff(moment(attrs.start_time, dateFormat)) / 1000;
      }
    }),
    this.on('saved', async (model, attrs) => {
    }),
    this.on('updating', async function(model, attrs, options) {
      let changedKeys = (Object.keys(model.changed))

      if (changedKeys.includes('start_time') || changedKeys.includes('end_time')) {
        let gwoItems = await new GwoItem().query((qb) => {
          qb.where('gwo_id', model.id)
        }).fetchAll({require: false})
        gwoItems = gwoItems.toJSON()
        // get the previous attributes
        // let gwoItems = model.relations.gwo_items.toJSON()
        let nodeIds = _.map(gwoItems, 'node_id')

        // console.log(model._previousAttributes)
        // console.log(model.attributes)
        let newStartTime = model.attributes.start_time
        let newEndTime = model.attributes.end_time
        newStartTime = moment(newStartTime, 'YYYY-MM-DD hh:mm:ss A')
        newEndTime = moment(newEndTime, 'YYYY-MM-DD hh:mm:ss A')

        await addRerunGwoOeeJob(nodeIds, model._previousAttributes.start_time, model._previousAttributes.end_time)
        await addRerunGwoOeeJob(nodeIds, newStartTime, newEndTime)
      }
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

    return _.sumBy(overlappedGwo.toJSON(), (item) => {
      let gwoStartTime = moment(item.start_time).isBefore(startTime) ? startTime : moment(item.start_time)
      let gwoEndTime = moment(item.end_time).isAfter(endTime) ? endTime : moment(item.end_time)

      return gwoEndTime.diff(gwoStartTime) / 1000
    })
  },
  //
  async getGwoBetween(nodeId, startTime, endTime) {
    let overlappedGwo = await (Gwo.query((qb) => {
      qb.select(
        [
          'gwo.id',
          'gwo.type',
          'gwo_items.node_id',
          'gwo_items.id AS gwo_item_id',
          'gwo.start_time',
          'gwo.end_time',
        ]
        )
        .join('gwo_items', 'gwo.id', 'gwo_items.gwo_id')
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
      return []
    }

    return overlappedGwo.toJSON().map(item => {
      let itemStartTime = moment(item.start_time)
      let itemEndTime = moment(item.end_time)

      if (itemStartTime.isBefore(startTime)) {
        itemStartTime = startTime.clone()
      }
      if (itemEndTime.isAfter(endTime)) {
        itemEndTime = endTime.clone()
      }
      item.start_time = itemStartTime
      item.end_time = itemEndTime
      item.duration = itemEndTime.diff(itemStartTime, 'seconds')

      return item
    })
  }
});

module.exports = Gwo;
