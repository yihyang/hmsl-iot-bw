const rootPath = './../../../..'
const bookshelf = require(`${rootPath}/config/bookshelf`)
const NodeGroup = require(`${rootPath}/app/models/Node/NodeGroup`)

const NodeGroupOEEPerformance = bookshelf.model('NodeGroupOEEPerformance', {
  hasTimestamps: true,
  tableName: 'node_group_oee_performances',
  soft: ['deleted_at'],
  nodeGroup() {
    return this.belongsTo(NodeGroup)
  }
})

module.exports = NodeGroupOEEPerformance
