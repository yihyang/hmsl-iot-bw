const moment = require('moment');

const rootPath = './../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);
const Node = require('./../Node/Node');
const User = require('./../Account/User');
const PoRecord = require('./PoRecord');
const PoBatch = require('./PoBatch');

const PoJob = bookshelf.model('PoJob', {
  hasTimestamps: true,
  tableName: 'po_jobs',
  initialize() {
    this.on('saved', async (model) => {
      // let poRecord = await new PoRecord({id: model.po_record_id}).fetch({require: false});
      let poRecord = model.po_record({require: false});
      if (poRecord && ((await poRecord.fetch({require: false})).toJSON().status != 'In Progress')) {
        poRecord.set('status', 'In Progress')
        poRecord.set('start_time', moment())
        poRecord.save()
      }
    })
  },
  ended_by() {
    return this.belongsTo(User, 'ended_by')
  },
  po_record() {
    return this.belongsTo(PoRecord)
  },
  po_batches() {
    return this.hasMany(PoBatch)
  },
  node() {
    return this.belongsTo(require('./../Node/Node'))
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
