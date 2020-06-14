const rootPath = './../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);
const Node = require('./Node');
const moment = require('moment');

const Event = bookshelf.model('Event', {
  hasTimestamps: true,
  tableName: 'events',
  initialize() {
    this.on('saving', function(model, attrs, options) {
      // set duration on save
      let {
        start_time,
        end_time,
        duration
      } = attrs;
      if (start_time && end_time && !duration) {
        attrs.duration = moment(end_time).diff(moment(start_time));
      }
    })
  },
  node() {
    return this.belongsTo(Node)
  }
})

module.exports = Event;
