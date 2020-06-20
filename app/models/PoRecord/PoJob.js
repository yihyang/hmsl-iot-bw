const rootPath = './../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);
const Node = require('./../Node/Node');
const User = require('./../Account/User');
const PoRecord = require('./PoRecord');

const PoJob = bookshelf.model('PoJob', {
  hasTimestamps: true,
  tableName: 'po_jobs',
  po_record() {
    return this.belongsTo(PoRecord)
  },
  node() {
    return this.belongsTo(Node)
  },
  user() {
    return this.belongsTo(User)
  }
}, {
  statuses() {
    return ['In Progress', 'Completed']
  }
});

module.exports = PoJob;
