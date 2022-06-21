const rootPath = './../../..'

const bookshelf = require(`${rootPath}/config/bookshelf`)

const Gwo = require('./Gwo')
const GwoItem = require('./GwoItem')
const GwoReason = require('./GwoReason')
const Event = require(`${rootPath}/app/models/Node/Event`)

const {
    asyncForEach
} = require(`${rootPath}/app/helpers/loop`)

var GwoItemEvent = bookshelf.Model.extend({
  hasTimeStamps: true,
  tableName: 'gwo_item_event',
  event() {
    return this.belongsTo(Event)
  },
  gwo_item() {
    return this.belongsTo(GwoItem)
  },
  gwo_reason() {
    return this.belongsTo(GwoReason)
  },
}, {
  async createOrUpdateFromGwo(gwoId = null) {
    // get the gwo
    let gwos = new Gwo()

    if (gwoId) {
      gwos = gwos.where('id', gwoId)
    }

    gwos = await gwos.fetchAll({withRelated: ['gwo_items']})
    gwos = gwos.toJSON()
    console.log(gwos)
    // loop the items
    await asyncForEach(gwos, async (gwo) => {
      let { start_time, end_time, gwo_reason_id } = gwo
      let gwoId = gwo.id
      if (!(start_time && end_time)) {
        console.log("GWO " + gwo.id + " is not updated as there are no start_time and end_time")
        return
      }
      await asyncForEach(gwo.gwo_items, async (item) => {
        await GwoItem.createOrUpdateFromGwoItem(item.id)
      })
    })
  }
})


module.exports = GwoItemEvent
