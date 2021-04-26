const rootPath = './../../../..'

const _ = require('lodash')
const moment = require('moment')
const bookshelf = require(`${rootPath}/config/bookshelf`);

let eventTime = async (startDate, endDate, eventType) => {
  let dateTimeFormat = 'YYYY-MM-DD hh:mm:ss';
  let startTime = moment(startDate).startOf('day');
  let endTime = moment(endDate).endOf('day');
  let formattedStartTime = startTime.format(dateTimeFormat);
  let formattedEndTime = endTime.format(dateTimeFormat);
  let formattedAWeekAgo = startTime.clone().subtract(1, 'week').format(dateTimeFormat);
  let eventsQuery = `
      WITH
      shifts AS (
        SELECT
          date_trunc('hour', dd) as shift_start,
          dd - interval '1 millisecond' + interval '1 hour' AS shift_end
        FROM generate_series(
          '${formattedStartTime}'::timestamp,
          '${formattedEndTime}'::timestamp,
          '1 hour'::interval
        ) dd
      ),
      segments AS (
        SELECT
          id,
          status,
          case
             when shifts.shift_start > start_time
            then shifts.shift_start
             else start_time
             end as start_split_segment,
         case
             when shifts.shift_end < end_time
            then shifts.shift_end
             when shifts.shift_end IS NULL
            then shifts.shift_end
             else end_time
             end as end_split_segment,
         COUNT(*) over (partition by id) as segment_count
        FROM
          events
        JOIN
          shifts
        ON
          events.start_time <= shifts.shift_end
          AND
          events.end_time > shifts.shift_start
        WHERE
          events.start_time >= '${formattedAWeekAgo}'
          AND events.status = ?
      )
      SELECT
        SUM(
          COALESCE(
            CAST(EXTRACT(EPOCH FROM (end_split_segment - start_split_segment)) AS DECIMAL),
            0)
        ) AS seconds
      FROM segments AS s
      join events AS e ON s.id = e.id
    `;
    console.log(eventsQuery)

    let result = (await bookshelf.knex.raw(eventsQuery, [eventType])).rows;
    return result;
}

let getBreakdownCount = async (startDate, endDate) => {
  let dateTimeFormat = 'YYYY-MM-DD hh:mm:ss';
  let startTime = moment(startDate).startOf('day');
  let endTime = moment(endDate).endOf('day');
  let formattedStartTime = startTime.format(dateTimeFormat);
  let formattedEndTime = endTime.format(dateTimeFormat);
  let breakdownQuery = `
    SELECT gwo_reasons.name, count(*) FROM gwo
      JOIN gwo_reasons
      ON gwo.gwo_reason_id = gwo_reasons.id
      WHERE type = 'unplanned'
      AND gwo.start_time >= ?
      AND gwo.end_time <= ?
      GROUP BY gwo_reasons.id
      ORDER BY count(*) DESC;
  `

  let result = (await bookshelf.knex.raw(breakdownQuery, [formattedStartTime, formattedEndTime])).rows

  return result
}

let calculateMeanTimeValue = (eventTotal, breakdowns) => {
  return { labels: _.map(breakdowns, (item) => item.name), values: _.map(breakdowns, (item) => item.count) }
}

let getDowntimeByCasePareto = async (startDate, endDate) => {
  let dateTimeFormat = 'YYYY-MM-DD hh:mm:ss';
  let startTime = moment(startDate).startOf('day');
  let endTime = moment(endDate).endOf('day');
  let formattedStartTime = startTime.format(dateTimeFormat);
  let formattedEndTime = endTime.format(dateTimeFormat);
  let downtimeQuery = `
    SELECT gwo_reasons.name, count(*) AS count
      FROM gwo
      JOIN gwo_reasons
      ON gwo.gwo_reason_id = gwo_reasons.id
      WHERE type = 'unplanned'
      AND gwo.start_time >= ?
      AND gwo.end_time <= ?
      GROUP BY gwo_reasons.id
      ORDER BY count(*) DESC;
  `

  let result = (await bookshelf.knex.raw(downtimeQuery, [formattedStartTime, formattedEndTime])).rows

  return { labels: _.map(result, (item) => item.name), values: _.map(result, (item) => item.count) }
}

let getDowntimeByDurationPareto = async (startDate, endDate) => {
  let dateTimeFormat = 'YYYY-MM-DD hh:mm:ss';
  let startTime = moment(startDate).startOf('day');
  let endTime = moment(endDate).endOf('day');
  let formattedStartTime = startTime.format(dateTimeFormat);
  let formattedEndTime = endTime.format(dateTimeFormat);
  let downtimeQuery = `
    SELECT gwo_reasons.name, SUM(EXTRACT(EPOCH FROM (end_time - start_time))) AS duration
      FROM gwo
      JOIN gwo_reasons
      ON gwo.gwo_reason_id = gwo_reasons.id
      WHERE type = 'unplanned'
      AND gwo.start_time >= ?
      AND gwo.end_time <= ?
      GROUP BY gwo_reasons.id
      ORDER BY duration DESC;
  `

  let result = (await bookshelf.knex.raw(downtimeQuery, [formattedStartTime, formattedEndTime])).rows

  return { labels: _.map(result, (item) => item.name), values: _.map(result, (item) => item.duration) }
}

let index = async function(req, res) {
  res.render('web/v1/mean-times/index')
}

let refresh = async (req, res) => {
  let {startDate, endDate} = req.query

  // mean time chart
  let runningTotal = (await eventTime(startDate, endDate, 'RUNNING'))[0].seconds || 0
  let stopTotal = (await eventTime(startDate, endDate, 'STOPPED'))[0].seconds || 0
  let breakdowns = await getBreakdownCount(startDate, endDate)
  let mtbr = calculateMeanTimeValue(runningTotal, breakdowns)
  let mttr = calculateMeanTimeValue(stopTotal, breakdowns)

  // downtime pareto chart
  let downtimeByCase = await getDowntimeByCasePareto(startDate, endDate);
  let downtimeByDuration = await getDowntimeByDurationPareto(startDate, endDate);

  // TODO: unplanned GWO
  let result = {
    mtbr, mttr, downtimeByCase, downtimeByDuration
  }
  console.log(result)
  res.json(result)
}

module.exports = {
  index,
  refresh
}
