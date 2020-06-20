const rootPath = './../../../..'
let shortfall = require('./PoRecord/ShortfallController')
const PoRecord = require(`${rootPath}/app/models/PoRecord/PoRecord`)

let index = async function(req, res) {
  let poRecords = (
    await new PoRecord().query(qb => {
      qb.orderBy('id', 'DESC')
    })
    .fetchAll({withRelated: 'user'})
  ).toJSON();

  res.render('web/v1/po-records/index', {poRecords})
}

module.exports = {
  index,
  shortfall
}
