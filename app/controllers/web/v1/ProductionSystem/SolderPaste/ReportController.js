const rootPath = './../../../../../..'

const bookshelf = require(`${rootPath}/config/bookshelf`)
const _ = require('lodash')

let index = (req, res) => {
  res.render('web/v1/production-systems/solder-pastes/reports/index')
}

let getData = async (req, res) => {
  // materials
  let allMaterialNumberQuery = `
    SELECT DISTINCT(material_number)
    FROM ps_solder_pastes
    ORDER BY material_number
  `
  let materialNumberResult = await bookshelf.knex.raw(allMaterialNumberQuery)
  let materialNumbers = _.map(materialNumberResult.rows, 'material_number')
  let groupByMaterialQuery = `
    SELECT to_char(date(created_at), 'YYYY-mm-dd') AS date, material_number, count(*) AS count
    FROM ps_solder_pastes
    GROUP BY to_char(date(created_at), 'YYYY-mm-dd'), material_number
  `
  let materialQueryResult = (await bookshelf.knex.raw(groupByMaterialQuery)).rows
  let materialChartData = formatDataForChart(materialQueryResult, 'material_number', materialNumbers)

  // employees
  let allEmployeeNameQuery = `
    SELECT DISTINCT(users.name)
    FROM ps_solder_pastes
    JOIN users ON ps_solder_pastes.creator_id = users.id
  `
  let employeeNameResult = await bookshelf.knex.raw(allEmployeeNameQuery)
  let employeeNames = _.map(employeeNameResult.rows, 'name')
  let groupByEmployeeNameQuery = `
    SELECT to_char(date(ps_solder_pastes.created_at), 'YYYY-mm-dd') AS date, users.name AS name, count(*) AS count
    FROM ps_solder_pastes
    JOIN users ON ps_solder_pastes.creator_id = users.id
    GROUP BY to_char(date(ps_solder_pastes.created_at), 'YYYY-mm-dd'), users.name
  `
  let employeeQueryResult = (await bookshelf.knex.raw(groupByEmployeeNameQuery)).rows
  let employeeChartData = formatDataForChart(employeeQueryResult, 'name', employeeNames)


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

function formatDataForChart(rawData, label, allLabels) {

  // insert raw data
  let materialResult = _.reduce(rawData, function (carry, item) {
    let date = item['date']
    let materialNumber = item[label]
    let count = parseFloat(item['count'])

    if (!carry[date]) {
      carry[date] = {}
    }

    carry[date][materialNumber] = count

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

  // let materialData = {
    // labels
  // }
  // labels (dates)
  let dates = _.sortBy(_.keys(materialResult))
  let labels = allLabels

  let data = {}
  for (var i = labels.length - 1; i >= 0; i--) {
    let materialNumber = labels[i]
    if (!data[materialNumber]) {
      data[materialNumber] = []
    }
    for (var j = 0; j < dates.length; j++) {
      let date = dates[j]
      data[materialNumber].push(materialResult[date][materialNumber])
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
