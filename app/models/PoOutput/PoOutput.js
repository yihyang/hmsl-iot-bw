const rootPath = './../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);
const Node = require('./../Node/Node');
const User = require('./../Account/User');

const PoOutput = bookshelf.model('PoOutput', {
  hasTimestamps: true,
  tableName: 'po_outputs',
  node() {
    return this.belongsTo(Node)
  },
  user() {
    return this.belongsTo(User)
  }
});

module.exports = PoOutput;
