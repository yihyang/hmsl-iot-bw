const rootPath = './../../../../../..'

const moment = require('moment')

let SolderPaste = require(rootPath + '/app/models/ProductionSystem/SolderPaste')


let index = (req, res) => {
  res.render('web/v1/production-systems/solder-pastes/records/index')
}

let search = async (req, res) => {
  let { length, start, draw, query, startDate, endDate, search } = req.query
  console.log(req.query)

  let records = await new SolderPaste()
    .query(qb => {
      qb.orderBy('id', 'DESC')
      if (startDate && endDate) {
        qb.where('created_at', '>=', startDate)
          .where('created_at', '<=', moment(endDate).add(1, 'day'))
      }
      if (search && search.value) {
        let searchValue = search.value
        qb.where(qb => {
          qb.where('po_number', 'LIKE', `%${searchValue}%`)
            .orWhere('material_number', 'LIKE', `%${searchValue}%`)
            .orWhere('batch', 'LIKE', `%${searchValue}%`)
        })
      }
    })
    .fetchPage({
      limit: length,
      offset: start,
      withRelated: ['creator']
    })

  let recordsTotal = records.pagination.rowCount
  let data = records.toJSON()

  res.json(
    {
      draw: parseInt(draw),
      data,
      recordsTotal,
      recordsFiltered: recordsTotal,
    }
  )
}

module.exports = {
  index,
  search,
}
