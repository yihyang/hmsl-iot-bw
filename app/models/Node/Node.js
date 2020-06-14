const rootPath = './../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);
const Event = require('./Event');
const moment = require('moment');
// const Area = require('./Area/Area');
const io = require('socket.io-client')

// connect to Server IO for broadcast
const {
  SOCKET_IO_HOST
} = process.env;
let socket = io.connect(SOCKET_IO_HOST);

const Node = bookshelf.model('Node', {
  hasTimestamps: true,
  tableName: 'nodes',
  initialize() {
    this.on('saving', function(model, attrs, options) {
      if (attrs['current_status']) {
        console.log(`[${moment()}] [Node saving event] - broadcast update`);
        socket.emit('nodeOnSavingUpdate', {
          id: model.id,
          status: attrs['current_status']
        });
      }
    })
  },
  area() {
    return this.belongsTo(Area)
  },
  events() {
    return this.hasMany(Event)
  }
})

module.exports = Node;
