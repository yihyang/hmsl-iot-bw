const rootPath = './../../../..'
const bookshelf = require(`${rootPath}/config/bookshelf`)

const CapacitityReason = bookshelf.model('DailyInputCapacityReason', {
  hasTimeStamps: true,
  soft: ['deleted_at'],
  tableName: 'oee_node_daily_input_capacity_reasons',
}, {
  statuses: ['ACTIVE', 'INACTIVE'],
})

module.exports = CapacitityReason
