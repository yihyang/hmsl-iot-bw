const moment = require('moment');
const rootPath = '.'
const bookshelf = require(`${rootPath}/config/bookshelf`);

async function runJob() {
      let formattedDate = moment().clone().format('YYYY-MM-DD')

      let qualityQuery = `
      SELECT
        CASE
          WHEN sum(input_quantity) = 0 THEN 0
          ELSE sum(produced_quantity) / sum(input_quantity)
        END AS value,
          date(created_at) FROM po_records
        WHERE date(created_at) = ?
        GROUP BY date(created_at)
      `
      let result = (await bookshelf.knex.raw(qualityQuery, formattedDate)).rows;

      let value = 0
      if (result.length != 0) {
        value = result[0].value
      }
}

runJob()
