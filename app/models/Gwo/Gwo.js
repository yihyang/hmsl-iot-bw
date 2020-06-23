const rootPath = './../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);
const User = require(`${rootPath}/app/models/Account/User`);
const GwoReason = require('./GwoReason')
const GwoItem = require('./GwoItem')
const moment = require('moment')

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
});

module.exports = Gwo;
