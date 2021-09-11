const rootPath = './../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);
const Node = require('./Node');
const moment = require('moment');

const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'

let logEventFilter = function (nodeId, startTime, endTime, message) {
  console.log(`Node ID - ${nodeId} - ${startTime.toISOString()} - ${endTime.toISOString()} - ${message}`)
}

const Event = bookshelf.model('Event', {
  hasTimestamps: true,
  tableName: 'events',
  initialize() {
    this.on('saving', function(model, attrs, options) {
      // set duration on save
      let {
        start_time,
        end_time,
        duration
      } = attrs;
      if (start_time && end_time && !duration) {
        attrs.duration = moment(end_time).diff(moment(start_time));
      }
    })
  },
  node() {
    return this.belongsTo(Node)
  }
}, {
  fillEventBeforeStartTime(event, startTime, endTime) {
    const STATUS_NO_EVENT = 'NO_EVENT'
    // case 1:
    //    event time = 7:40 - null, status: RUNNING  (ongoing)
    //    query time = 8:00 - 8:15
    //    return -> RUNNING -> 8:00 - 8:15
    // case 2:
    //    event time = 7:40 - 7:50, status: RUNNING (ended before query start time)
    //    query time = 8:00 - 8:15
    //    return -> unknown -> 8:00 - 8:15
    // case 3:
    //    event time = 7:40 - 8:05, status: RUNNING  (ended before query end time)
    //    query time = 8:00 - 8:15
    //    return -> RUNNING -> 8:00 - 8:05, UNKNOWN -> 8:05:01 - 8:15
    // case 4:
    //    event time = 7:40 - 8:20, status: RUNNING  (ended after query end time)
    //    query time = 8:00 - 8:15
    //    return -> RUNNING -> 8:00 - 8:15
    let eventEndTime = event.attributes.end_time
    // case 1
    if (!eventEndTime) {
      return [
        {
          status: event.attributes.status,
          start_time: startTime.clone(),
          end_time: endTime.clone(),
          duration: endTime.diff(startTime, 'seconds'),
          id: event.id,
        }
      ]
    }

    // cast to moment
    eventEndTime = moment(event.attributes.end_time)
    if (eventEndTime.isBefore(startTime)) {
      // console.log('case 2')
      event.end_time
      return [
        {
          status: STATUS_NO_EVENT,
          start_time: startTime.clone(),
          end_time: endTime.clone(),
          duration: endTime.diff(startTime, 'seconds'),
          id: null,
        }
      ]
    // case 3
    } else if (eventEndTime.isBefore(endTime)) {
      // console.log('case 3')
      // first event
      let firstEventStartTime = startTime.clone()
      let firstEventEndTime = eventEndTime.clone()
      let firstEventDuration = firstEventEndTime.diff(firstEventStartTime, 'seconds')
      // second event
      let secondEventStartTime = firstEventEndTime.clone().add(1, 'millisecond')
      let secondEventEndTime = endTime.clone()
      let secondEventDuration = secondEventEndTime.diff(secondEventStartTime, 'seconds')

      return [
        {
          status: event.attributes.status,
          start_time: firstEventStartTime,
          end_time: firstEventEndTime,
          duration: firstEventDuration,
          id: event.id,
        },
        {
          status: STATUS_NO_EVENT,
          start_time: secondEventStartTime,
          end_time: secondEventEndTime,
          duration: secondEventDuration,
          id: null,
        },
      ]
    // case 4
    } else {
      // console.log('case 4')
      return [
        {
          status: event.attributes.status,
          start_time: startTime.clone(),
          end_time: endTime.clone(),
          duration: endTime.diff(startTime, 'seconds'),
          id: event.id,
        }
      ]
    }
  },
  /**
   * Get event between specified time for a node
   *
   * @param  {Carbon} startTime Start Time
   * @param  {Carbon} endTime   End TIme
   * @return {array}            array of time in the following format {start_time:, end_time, duration, status}
   */
  async getEventsBetween(nodeId, startTime, endTime) {
    let jobStartTime = moment()
    let result = []
    let formattedStartTime = startTime.format(DATETIME_FORMAT);
    let formattedEndTime = endTime.format(DATETIME_FORMAT);
    // find all events where start time > start of hour and start time <= end of hour
    let eventsWithinTimeRange = await new Event().query(
      function(qb) {
        qb.where('start_time', '>=', formattedStartTime)
          .where('start_time', '<=', formattedEndTime)
          .andWhere('node_id', nodeId)
          .orderBy('id', 'ASC')
      }
    ).fetchAll();
    let jsonEventsWithinTimeRange = []
    // console.log(JSON.stringify(eventsWithinTimeRange))

    if (eventsWithinTimeRange.length) {
      jsonEventsWithinTimeRange = eventsWithinTimeRange.toJSON()
    }
    // find the last event before start time
    // console.log(nodeId, formattedStartTime)
    let lastEventBeforeStartTime = await new Event().query(
      function(qb) {
        qb.where('start_time', '<', formattedStartTime)
          .where('node_id', nodeId)
          .orderBy('id', 'DESC')
          .limit(1)
      }
    ).fetch({require: false});

    // console.log(lastEventBeforeStartTime)
    // console.log("===================")
    // result should be formatted in {status:, start_time:, end_time:, duration:,}

    // if there is no event and no last event just insert empty
    if (!jsonEventsWithinTimeRange.length && !lastEventBeforeStartTime) {
      logEventFilter(nodeId, startTime, endTime, "No event within last hour and no last event")
      let difference = moment().diff(jobStartTime);
      logEventFilter(nodeId, startTime, endTime, `Job finished in ${difference}`);
      return [];
    }

    // no event within the hour but got last event (means last event continued within this hour)
    if (!jsonEventsWithinTimeRange.length && lastEventBeforeStartTime) {
      logEventFilter(nodeId, startTime, endTime, "No event within last hour and has last event")
      return this.fillEventBeforeStartTime(lastEventBeforeStartTime, startTime, endTime)
    }


    logEventFilter(nodeId, startTime, endTime, "Has events between time range")
    jsonEventsWithinTimeRange.forEach((eventItem, index) => {
      let eventStartTime = moment(eventItem.start_time)
      let eventEndTime = moment(eventItem.end_time)
      // logEventFilter(nodeId, startTime, endTime, eventStartTime)
      // first event, need to insert event if:
      //    - the event start time is not same as the hour start time
      //    - there is a event before start time
      if (index == 0 && !eventStartTime.isSame(startTime) && lastEventBeforeStartTime) {
        // event before end time = the subsequent event start time - 1 millisecond
        let eventBeforeEndTime = eventStartTime.subtract(1, 'millisecond')
        result = result.concat(this.fillEventBeforeStartTime(lastEventBeforeStartTime, startTime, eventBeforeEndTime))
      }
      // subsequent events check whether does it end later than start time
      if (!eventItem.end_time || moment(eventItem.end_time).isAfter(endTime)) {
        eventEndTime = endTime.clone()
      }
      let duration = eventEndTime.diff(eventStartTime, 'seconds')
      result.push({
        status: eventItem.status,
        start_time: eventStartTime,
        end_time: eventEndTime,
        duration,
        id: eventItem.id,
      })
    })
    let difference = moment().diff(jobStartTime, 'seconds');
    logEventFilter(nodeId, startTime, endTime, `Job finished in ${difference}`);


    return result
  },
})

module.exports = Event;
