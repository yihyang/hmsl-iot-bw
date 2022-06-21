const rootPath = './../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);
const Gwo = require('./Gwo');
const GwoItemSparePartUsage = require('./GwoItemSparePartUsage');
const Node = require('./../Node/Node');
const moment = require('moment')
const { oeeReworkQueue } = require(`${rootPath}/app/queues/oee_rework`)
const {
  getDateRange
} = require(`${rootPath}/app/helpers/date_helper`)
const {
  addRerunGwoOeeJob,
  addRunGwoItemEventsLinkJob,
} = require(`${rootPath}/app/helpers/queue_helper`)
const {
    asyncForEach
} = require(`${rootPath}/app/helpers/loop`)

// General Work Order
var GwoItem = bookshelf.Model.extend({
  hasTimestamps: true,
  tableName: 'gwo_items',
  initialize() {
    this.on('saved', async (model, attrs) => {
      let gwoItem = await model.fetch()
      if (!gwoItem) {
        return;
      }

      let gwo  = await model.gwo().fetch()
      // set the OEE availabilities 'need_rework' = true
      // set the OEE performances 'need_rework' = true

      let { start_time, end_time } = gwo.attributes
      let node_id = model.attributes.node_id
      let dateRanges = getDateRange(start_time, end_time)

      await asyncForEach(dateRanges, async (date) => {
        // console.log(node_id, date)
        await addRerunGwoOeeJob([node_id], date)
      })

      await addRunGwoItemEventsLinkJob(model.id)
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
}, {
  async createOrUpdateFromGwoItem(gwoItemId = null) {
    let gwoItems = await (new GwoItem())
    if (gwoItemId) {
      gwoItems = gwoItems.where('id', gwoItemId)
    }
    gwoItems = await gwoItems.fetchAll({withRelated: ['gwo']})
    gwoItems = gwoItems.toJSON()

    await asyncForEach(gwoItems, async (gwoItem) => {
      let { node_id, gwo } = gwoItem
      let gwoItemRecordId = gwoItem.id
      let { start_time, end_time, gwo_reason_id } = gwo
      let gwoId = gwo.id
      if (!(start_time && end_time)) {
        console.log("GWO " + gwo.id + " is not updated as there are no start_time and end_time")
        return
      }

      console.log('GwoItemEvent@createOrUpdateFromGwo - GWO Item ID - ' + gwoItemRecordId)
      // find event in between the date range
      // NOTE: there's isue with GwoItem's reference to event
      let events = new require(`${rootPath}app/models/Node/Event`)
      events = events.where('start_time', '>=', start_time)
        .where('end_time', '<=', end_time)
        .where('node_id', node_id)
      events = await events.fetchAll()
      events = events.toJSON()
      console.log('GwoItemEvent@createOrUpdateFromGwo - ' + events.length + ' event(s)')

      // NOTE: there's isue with GwoItem's reference to gwo item event
      let gwoItemEventModel = require('./GwoItemEvent')
      await asyncForEach(events, async (event) => {
        let eventId = event.id
        let existingItemEvent = await new gwoItemEventModel({
          gwo_item_id: gwoItemRecordId,
          event_id: eventId,
        }).fetch()

        // if got existing event
        //     update reason
        if (existingItemEvent) {
          existingItemEvent = existingItemEvent.set('gwo_reason_id', gwo_reason_id)
          await existingItemEvent.save()

          console.log('existing gwo item event - ' + existingItemEvent.id)

          return
        }

        // else
        //     create new record
        let newItemEvent = await new gwoItemEventModel({
          gwo_item_id: gwoItemRecordId,
          event_id: eventId,
          gwo_reason_id: gwo_reason_id,
        }).save()
        console.log('new gwo item event - ' + newItemEvent.id)
      })

    })

  }
});

module.exports = GwoItem;
