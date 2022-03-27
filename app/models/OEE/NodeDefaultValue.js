const rootPath = './../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);
const Node = require('./../Node/Node');
const moment = require('moment');

const DEFAULT_AVAILABILITY_VALUE = 12
// NOTE: HMSL has not used capacity yet
const DEFAULT_CAPACITY_VALUE = 0

const NodeDefaultValue = bookshelf.model('NodeDefaultValue', {
  hasTimestamps: true,
  tableName: 'oee_node_default_values',
  node() {
    return this.belongsTo(Node)
  },
}, {
  // NOTE: return an object that contains default value if not exists
  async getDefaultValueObject(nodeId) {
    let defaultValue = await new NodeDefaultValue().query(qb => qb.where('node_id', nodeId)).fetch({require: false})

    if (!defaultValue) {
      return {
        am_availability: DEFAULT_AVAILABILITY_VALUE,
        pm_availability: DEFAULT_AVAILABILITY_VALUE,
        am_capacity: DEFAULT_CAPACITY_VALUE,
        pm_capacity: DEFAULT_CAPACITY_VALUE,
      }
    }

    let {
      am_availability,
      pm_availability,
      am_capacity,
      pm_capacity,
    } = defaultValue.attributes

    return {
      am_availability: am_availability || DEFAULT_AVAILABILITY_VALUE,
      pm_availability: pm_availability || DEFAULT_AVAILABILITY_VALUE,
      am_capacity: am_capacity || DEFAULT_CAPACITY_VALUE,
      pm_capacity: pm_capacity || DEFAULT_CAPACITY_VALUE,
    }
  }
})

module.exports = NodeDefaultValue;
