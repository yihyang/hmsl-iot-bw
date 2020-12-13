const rootPath = './../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);
// const Node = require('./Node');

const NodeGroup = bookshelf.model('NodeGroup', {
  hasTimestamps: true,
  tableName: 'node_groups',
  nodes() {
    return this.hasMany(require('./Node'))
  }
})

module.exports = NodeGroup;
