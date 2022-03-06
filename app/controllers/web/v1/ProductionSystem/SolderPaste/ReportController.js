const rootPath = './../../../../../..'

const bookshelf = require(`${rootPath}/config/bookshelf`)
const _ = require('lodash')
const moment = require('moment')

let index = (req, res) => {
  res.render('web/v1/production-systems/solder-pastes/reports/index')
}

let getData = async (req, res) => {
  let { startDate, endDate } = req.body
  let dateQuery = ''
  let queryObject = []
  if (startDate && endDate) {
    startDate = moment(startDate).format('YYYY-MM-DD')
    endDate = moment(endDate).add(1, 'day').format('YYYY-MM-DD')

    dateQuery = `WHERE ps_solder_pastes.created_at >= ? AND ps_solder_pastes.created_at <= ?`
    queryObject = [startDate, endDate]
  }
  // materials
  let allMaterialNumberQuery = `
    SELECT DISTINCT(material_number)
    FROM ps_solder_pastes
    ${dateQuery}
    ORDER BY material_number
  `
  let materialNumberResult = await bookshelf.knex.raw(allMaterialNumberQuery, queryObject)
  let materialNumbers = _.map(materialNumberResult.rows, 'material_number')
  let groupByMaterialQuery = `
    SELECT to_char(date(created_at), 'YYYY-mm-dd') AS date, material_number, SUM(weight) AS weight
    FROM ps_solder_pastes
    ${dateQuery}
    GROUP BY to_char(date(created_at), 'YYYY-mm-dd'), material_number
  `
  let materialQueryResult = (await bookshelf.knex.raw(groupByMaterialQuery, queryObject)).rows
  let materialChartData = formatDataForChart(materialQueryResult, 'material_number', materialNumbers, 'weight')

  // employees
  let allEmployeeNameQuery = `
    SELECT DISTINCT(users.name)
    FROM ps_solder_pastes
    JOIN users ON ps_solder_pastes.creator_id = users.id
    ${dateQuery}
  `
  let employeeNameResult = await bookshelf.knex.raw(allEmployeeNameQuery, queryObject)
  let employeeNames = _.map(employeeNameResult.rows, 'name')
  let groupByEmployeeNameQuery = `
    SELECT to_char(date(ps_solder_pastes.created_at), 'YYYY-mm-dd') AS date, users.name AS name, SUM(weight) AS weight
    FROM ps_solder_pastes
    JOIN users ON ps_solder_pastes.creator_id = users.id
    ${dateQuery}
    GROUP BY to_char(date(ps_solder_pastes.created_at), 'YYYY-mm-dd'), users.name
  `
  let employeeQueryResult = (await bookshelf.knex.raw(groupByEmployeeNameQuery, queryObject)).rows
  let employeeChartData = formatDataForChart(employeeQueryResult, 'name', employeeNames, 'weight')


  res.json({
    data: {
      materials: {
        raw_data: materialQueryResult,
        chart_data: materialChartData
      },
      employees: {
        raw_data: employeeQueryResult,
        chart_data: employeeChartData
      }
    }
  })
}

function formatDataForChart(rawData, label, allLabels, itemValueName) {
  let dates = _.sortBy(_.uniq(_.map(rawData, 'date')))
  let labels = allLabels

  // group data by date & material
  let materialResult = _.reduce(rawData, function (carry, item) {
    let date = item['date']
    let materialNumber = item[label]
    let value = parseFloat(item[itemValueName])

    if (!carry[date]) {
      carry[date] = {}
    }

    carry[date][materialNumber] = value

    return carry
  }, {})

  // insert balance data
  materialResult = _.mapValues(materialResult, function(item) {
    for (var i = allLabels.length - 1; i >= 0; i--) {
      let materialNumber = allLabels[i]

      // insert default value
      if (!item[materialNumber]) {
        item[materialNumber] = 0
      }
    }

    return item
  })

  let data = {}
  for (let i = 0; i < labels.length; i++) {
    let label = labels[i]
    if (!data[label]) {
      data[label] = []
    }

    for(let j = 0; j < dates.length; j++) {
      let date = dates[j]
      data[label].push(materialResult[date][label] || 0)
    }

  }

  return {
    dates,
    data,
    labels,
  }
}

module.exports = {
  index,
  getData,
}
