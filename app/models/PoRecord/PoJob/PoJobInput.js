const moment = require('moment');

const rootPath = './../../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);
const User = require(`${rootPath}/app/models/Account/User`);
const PoRecord = require(`${rootPath}/app/models/PoRecord/PoRecord`);
const PoJob = require('./../PoJob');

const PoJobInput = bookshelf.model('PoJobInput', {
  hasTimestamps: true,
  tableName: 'po_job_inputs',
  initialize() {
    this.on('saved', (model) => {
      PoRecord.updateInputQuantity(model.id);
    })
  },
  po_job() {
    return this.belongsTo(PoJob)
  },
  user() {
    return this.belongsTo(User)
  }
}, {
});

module.exports = PoJobInput;
