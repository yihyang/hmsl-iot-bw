const _ = require('lodash')
const moment = require('moment')

const rootPath = './../../..';

const bookshelf = require(`${rootPath}/config/bookshelf`);
const OEE = require(`${rootPath}/app/models/OEE/OEE`);
const Event = require(`${rootPath}/app/models/Node/Event`);
const Node = require(`${rootPath}/app/models/Node/Node`);
const Gwo = require(`${rootPath}/app/models/Gwo/Gwo`);

const OEEPerformance = bookshelf.model('OEEPerformance', {
  hasTimestamps: true,
  tableName: 'oee_performances',
  soft: ['deleted_at'],
  oee() {
    return this.belongsTo(OEE)
  },
  node() {
    return this.belongsTo(Node)
  }
}, {
  async calculateHourSummary(nodeId, startTime, endTime) {
    let dateFormat = 'YYYY-MM-DD hh:mm:ss';
    let formattedStartTime = startTime.format();
    let formattedEndTime = endTime.format();
    let formattedAWeekAgo = startTime.clone().subtract(1, 'week').format();
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
          AND events.node_id = '${nodeId}'
      )
      SELECT
        e.id AS event_id,
        'event' AS main_group,
        e.status AS subgroup,
        nodes.id AS node_id,
        start_split_segment,
        end_split_segment,
        start_time,
        end_time,
      date_trunc('hour', start_split_segment) AS starting_hour,
      (date_trunc('hour', end_split_segment) - interval '1 millisecond' + interval '1 hour') AS ending_hour,
      -- default value 0
      COALESCE(
        CAST(EXTRACT(EPOCH FROM (end_split_segment - start_split_segment)) AS DECIMAL),
        0) AS seconds
      FROM segments AS s
      join events AS e ON s.id = e.id
      JOIN nodes ON e.node_id = nodes.id
      ORDER BY e.id ASC
    `;

    // GWO query
    let gwoQuery = `
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
          gwo.id,
          gwo.type,
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
         COUNT(*) over (partition by gwo.id) as segment_count
        FROM
          gwo
        JOIN gwo_items
          ON gwo.id = gwo_items.gwo_id
        JOIN
          shifts
        ON
          gwo.start_time <= shifts.shift_end
          AND
          gwo.end_time > shifts.shift_start
        WHERE
          gwo.start_time >= '${formattedAWeekAgo}'
          AND gwo_items.node_id = '${nodeId}'
      )
      SELECT
        g.id AS event_id,
        'gwo' AS main_group,
        g.type AS subgroup,
        nodes.id AS node_id,
        start_split_segment,
        end_split_segment,
        start_time,
        end_time,
      date_trunc('hour', start_split_segment) AS starting_hour,
      (date_trunc('hour', end_split_segment) - interval '1 millisecond' + interval '1 hour') AS ending_hour,
      -- default value 0
      COALESCE(
        CAST(EXTRACT(EPOCH FROM (end_split_segment - start_split_segment)) AS DECIMAL),
        0) AS seconds
      FROM segments AS s
      JOIN gwo AS g ON s.id = g.id
      JOIN gwo_items ON gwo_items.gwo_id = g.id
      JOIN nodes ON gwo_items.node_id = nodes.id
      ORDER BY g.id ASC
    `;



    let events = (await bookshelf.knex.raw(eventsQuery)).rows;
    let gwo = (await bookshelf.knex.raw(gwoQuery)).rows;

    // prepare the data
    let breakdown = [];
    let currentTime = startTime.clone();
    let result = [];

    // loop through GWO items
    for (let i = 0; i < gwo.length; i++) {
      let gwoItem = gwo[i];
      let gwoItemStartTime = moment(gwo[i].start_time);
      let gwoItemEndTime = moment(gwo[i].end_time);

      // filter all the event before the current gwo item or after current time
      let filteredEvents = _.filter(events, (event) => {
        let itemStartTime = moment(event.start_time);
        let itemEndTime = moment(event.end_time);

        return itemStartTime.isSameOrBefore(gwoItemStartTime) || itemEndTime.isSameOrAfter(currentTime);
      })

      for (let i = 0; i < filteredEvents.length; i++) {
        let item = filteredEvents[i];
        let itemStartTime = moment(item.start_time);
        let itemEndTime = moment(item.end_time);

        if (itemStartTime.isBefore(gwoItemStartTime) && itemEndTime.isBefore(gwoItemStartTime)) {
          // current event item start and end time is before the start time of the gwo event
          result.push({
            main_group: item.main_group,
            subgroup: item.subgroup,
            originator_type: 'Event',
            originator_id: item.id,
            start_time: currentTime,
            end_time: itemEndTime,
            duration: itemEndTime.diff(currentTime) / 1000, // offset milliseconds
          });

          currentTime = itemEndTime; // move current time forward
        } else if (itemStartTime.isBefore(gwoItemStartTime) && itemEndTime.isBefore(gwoItemEndTime)) {
          // current event start time is before gwo item start time
          // but the end time is before the end time of gwo item
          result.push({
            main_group: item.main_group,
            subgroup: item.subgroup,
            originator_type: 'Event',
            originator_id: item.id,
            start_time: currentTime,
            end_time: gwoItemEndTime,
            duration: gwoItemEndTime.diff(currentTime) / 1000
          })

          currentTime = itemStartTime; // move current time forward
        }
      }

      let lastItemEndTime = gwoItemEndTime;
      if (gwoItemEndTime.isAfter(endTime)) {
        lastItemEndTime = endTime
      }

      result.push({
        main_group: gwoItem.main_group,
        subgroup: gwoItem.subgroup,
        originator_type: 'GwoItem',
        originator_id: gwoItem.gwo_id,
        start_time: gwoItemStartTime,
        end_time: lastItemEndTime,
        duration: lastItemEndTime.diff(gwoItemStartTime) / 1000
      })

      currentTime = lastItemEndTime;
    }

    // fill in the events after gwo
    if (endTime.isAfter(currentTime)) {
      // filter events that ends after current time
      // filter all the event before the current gwo item or after current time
      let filteredEvents = _.filter(events, (event) => {
        let itemStartTime = moment(event.start_time);
        let itemEndTime = moment(event.end_time);

        return itemEndTime.isSameOrAfter(currentTime);
      })

      for (let i = 0; i < filteredEvents.length; i++) {
        let item = filteredEvents[i];
        let itemStartTime = moment(item.start_time);
        let itemEndTime = moment(item.end_time);

        if (itemStartTime.isBefore(currentTime)) {
          itemStartTime = currentTime;
        }

        if (itemEndTime.isAfter(endTime)) {
          itemEndTime = endTime
        }


        result.push({
          main_group: item.main_group,
          subgroup: item.subgroup,
          originator_type: 'Event',
          originator_id: item.event_id,
          start_time: itemStartTime,
          end_time: itemEndTime,
          duration: itemEndTime.diff(itemStartTime) / 1000
        })
      }
    }


    let eventsBreakdown = result.reduce((carry, item) => {
      let itemName = (item.main_group + '-' + item.subgroup).toUpperCase();
      if (carry[itemName]) {
        carry[itemName] += item.duration;
      } else {
        carry[itemName] = item.duration;
      }

      return carry;
    }, {});


    // value = all event - gwo - down time / all event - gwo
    let allGwo = (eventsBreakdown['GWO-PLANNED'] || 0) + (eventsBreakdown['GWO-UNPLANNED'] ||0)
    let downtimeEvent = eventsBreakdown['EVENT-STOPPED'] || 0
    let allTime = endTime.diff(startTime) / 1000 // convert millisecond to second

    let value = (allTime - allGwo - downtimeEvent) / (allTime - allGwo)

    let isoFormattedStartTime = startTime.toISOString();
    let isoFormattedEndTime = endTime.toISOString();
    let jsonBreakdown = JSON.stringify(result);

    let existingSummary = await new OEEPerformance({node_id: nodeId, start_time: isoFormattedStartTime, end_time: isoFormattedEndTime}).fetch({require: false})

    if (existingSummary) {
      existingSummary.set('value', value);
      existingSummary.set('value_breakdown', jsonBreakdown);
      existingSummary.set('events_breakdown', eventsBreakdown);
      existingSummary.save();
    } else {
      await new OEEPerformance({
        node_id: nodeId,
        start_time: isoFormattedStartTime,
        end_time: endTime,
        events_breakdown: eventsBreakdown,
        value_breakdown: jsonBreakdown,
        value: value,
      }).save();
    }
  },
  // NOTE v2: improve performance
  async calculateHourSummaryV2(nodeId, startTime, endTime) {
    // get event within time range
    // get GWO within time range
    let events = await Event.getEventsBetween(nodeId, startTime, endTime)
    let gwo = await Gwo.getGwoBetween(nodeId, startTime, endTime)
    // get event end time
    // console.log(events)
    // console.log(gwo)

    // preparing data
    let breakdown = []
    let currentTime = startTime.clone();
    let result = [];

    // combine both gwo and events together
    for (let i = 0; i < gwo.length; i++) {
      let gwoItem = gwo[i];
      let gwoItemStartTime = moment(gwoItem.start_time);
      let gwoItemEndTime = moment(gwoItem.end_time);

      // filter all the event before the current gwo item or after current time
      let filteredEvents = _.filter(events, (event) => {
        let itemStartTime = moment(event.start_time);
        let itemEndTime = moment(event.end_time);

        return itemStartTime.isSameOrBefore(gwoItemStartTime) || itemEndTime.isSameOrAfter(currentTime);
      })

      for (let i = 0; i < filteredEvents.length; i++) {
        let item = filteredEvents[i];
        let itemStartTime = moment(item.start_time);
        let itemEndTime = moment(item.end_time);

        if (itemStartTime.isBefore(gwoItemStartTime)) {
          let recordEndTime = itemEndTime.clone()
          if (itemEndTime.isAfter(gwoItemStartTime)) {
            recordEndTime = gwoItemStartTime.clone().subtract(1, 'milliseconds')
          }
          result.push({
            main_group: 'event',
            subgroup: item.status,
            originator_type: 'event',
            originator_id: item.id,
            start_time: currentTime,
            end_time: recordEndTime,
            duration: recordEndTime.diff(currentTime, 'seconds'), // offset milliseconds
          })

          // move time forward
          currentTime = gwoItemStartTime.clone()
        }
      }

      let lastItemEndTime = gwoItemEndTime;
      if (endTime.isAfter(lastItemEndTime)) {
        lastItemEndTime = endTime.clone()
      }
      result.push({
        main_group: 'gwo',
        subgroup: gwoItem.type,
        originator_type: 'gwo_item',
        originator_id: gwoItem.gwo_item_id,
        start_time: gwoItemStartTime,
        end_time: lastItemEndTime,
        duration: lastItemEndTime.diff(gwoItemStartTime) / 1000
      })

      currentTime = lastItemEndTime;
    }
    // fill in the events after gwo
    if (endTime.isAfter(currentTime)) {
      // filter events that ends after current time
      // filter all the event before the current gwo item or after current time
      let filteredEvents = _.filter(events, (event) => {
        let itemStartTime = moment(event.start_time);
        let itemEndTime = moment(event.end_time);

        return itemEndTime.isSameOrAfter(currentTime);
      })
      // console.log('---+++--')
      // console.log(events.length)
      // console.log('---***--')
      // console.log(filteredEvents.length)

      for (let i = 0; i < filteredEvents.length; i++) {
        let item = filteredEvents[i];
        let itemStartTime = moment(item.start_time).clone();
        let itemEndTime = moment(item.end_time).clone();

        if (itemStartTime.isBefore(currentTime)) {
          itemStartTime = currentTime.clone();
        }

        if (itemEndTime.isAfter(endTime)) {
          itemEndTime = endTime.clone()
        }


        result.push({
          main_group: 'event',
          subgroup: item.status,
          originator_type: 'Event',
          originator_id: item.id,
          start_time: itemStartTime,
          end_time: itemEndTime,
          duration: itemEndTime.diff(itemStartTime) / 1000
        })
        // console.log(result)
      }
    }

    let eventsBreakdown = result.reduce((carry, item) => {
      let itemName = (item.main_group + '-' + item.subgroup).toUpperCase();
      if (carry[itemName]) {
        carry[itemName] += item.duration;
      } else {
        carry[itemName] = item.duration;
      }

      return carry;
    }, {});

    // NOTE: old formula deprecated on 13th June 2021
    // down time is 1 - (sum / second per minute)
    // let value = 1 - ((eventsBreakdown['EVENT-STOPPED'] || 0) / 3600);
    // value = all event - gwo - down time / all event - gwo
    let allGwo = (eventsBreakdown['GWO-PLANNED'] || 0) + (eventsBreakdown['GWO-UNPLANNED'] ||0)
    let downtimeEvent = eventsBreakdown['EVENT-STOPPED'] || 0
    let allTime = endTime.diff(startTime) / 1000 // convert millisecond to second

    let value = (allTime - allGwo - downtimeEvent) / (allTime - allGwo)

    let isoFormattedStartTime = startTime.toISOString();
    let isoFormattedEndTime = endTime.toISOString();
    let jsonBreakdown = JSON.stringify(result);

    let existingOEEPerformance = await new OEEPerformance({node_id: nodeId, start_time: isoFormattedStartTime, end_time: isoFormattedEndTime}).fetch({require: false})


    if (existingOEEPerformance) {
      existingOEEPerformance.set('value', value);
      existingOEEPerformance.set('value_breakdown', jsonBreakdown);
      existingOEEPerformance.set('events_breakdown', eventsBreakdown);
      existingOEEPerformance.save();
    } else {
      await new OEEPerformance({
        node_id: nodeId,
        start_time: isoFormattedStartTime,
        end_time: endTime,
        events_breakdown: eventsBreakdown,
        value_breakdown: jsonBreakdown,
        value: value,
      }).save();
    }
  },
})

module.exports = OEEPerformance;
