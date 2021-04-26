const rootPath = './../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);
const Event = require('./Event');
const PoJob = require('../PoRecord/PoJob')
const NodeGroup = require('./NodeGroup')
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
  active_po_job() {
    return this.hasOne(PoJob, 'id', 'active_po_job_id')
  },
  events() {
    return this.hasMany(Event)
  },
  node_group() {
    return this.belongsTo(NodeGroup)
  },
  po_jobs() {
    return this.hasMany(PoJob)
  },
})

module.exports = Node;
