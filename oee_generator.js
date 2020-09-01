const moment = require('moment');
const Event = require('./app/models/Node/Event');
const Node = require('./app/models/Node/Node')
const _ = require('lodash');
const schedule = require('node-schedule')
const {
  asyncForEach
} = require('./app/helpers/loop');

const NodeDailyInput = require('./app/models/OEE/NodeDailyInput')
const OEE = require('./app/models/OEE/OEE')
const OEEAvailability = require('./app/models/OEE/OEEAvailability')
const OEEPerformance = require('./app/models/OEE/OEEPerformance')
const OEEQuality = require('./app/models/OEE/OEEQuality')


let getAllNodes = async() => {
  return new Promise(async(resolve, reject) => {
    let allNodes = (await new Node().fetchAll()).toJSON();
    resolve(allNodes);
  })
}

// calculate availability
// calculate performance
// calculate quality
/****************/
/* availability */
/****************/
let runAvailabilityJob = async (currentDate) => {
  return new Promise(async(resolve, reject) => {
    console.log('--- Running Availability Job ---')
    let nodes = await getAllNodes();

    await asyncForEach(nodes, async (node) => {
      console.log(`Started Inserting "availability" for ${node.name}`)
      const HOUR_PER_DAY = 24
      let availabilityStartOfDay = currentDate.clone().startOf('day')
      let availabilityEndOfDay = currentDate.clone().startOf('day')

      // set the values
      let dailyValue = (await new NodeDailyInput({node_id: node.id, date: currentDate.clone().format('YYYY-MM-DD')}).fetch({require: false}));

      if (dailyValue) {
        value = dailyValue['am_availability'] + dailyValue['pm_availability'];
      } else {
        value = 0;
      }

      // insert record
      let existingAvailability = await new OEEAvailability({node_id: node.id, start_time: availabilityStartOfDay, end_time: availabilityEndOfDay}).fetch({require: false})
      if (existingAvailability) {
        existingAvailability.set('value', value)
      }
      await new OEEAvailability({
        node_id: node.id,
        start_time: availabilityStartOfDay,
        end_time: availabilityEndOfDay,
        value: value
      }).save()

      console.log(`Completed Inserting "availability" for ${node.name}`)
    })

    console.log('--- Completed Availability Job ---')

    resolve()
  })
}


/***************/
/* performance */
/***************/
let runPerformanceJob = async (currentDate) => {
  return new Promise(async(resolve, reject) => {
    console.log('--- Running Performance Job ---')

    let nodes = await getAllNodes();

    await asyncForEach(nodes, async (node) => {
      console.log(`Started inserting "performance" for ${node.name}`);

      let performanceStartOfDay = currentDate.clone().startOf('day')
      let performanceEndOfDay = currentDate.clone().endOf('day')
      let currentTime = performanceStartOfDay.clone()
      let times = [];
      while (currentTime.isBefore(performanceEndOfDay)) {
        times.push({startTime: currentTime.clone(), endTime: currentTime.clone().endOf('hour')});
        currentTime = currentTime.add(1, 'hour');
      }

      await asyncForEach(times, async time => {
        await asyncForEach(nodes, async node => {
          await OEEPerformance.calculateHourSummary(node.id, time.startTime, time.endTime)
        })
      })

      console.log(`Completed inserting "performance" for ${node.name}`);
    })

    console.log('--- Completed Performance Job ---')

    resolve()
  })
}

/***********/
/* quality */
/***********/
let runQualityJob = async (currentDate) => {
  return new Promise(async(resolve, reject) => {
    const OEE_AVAILABILITY_DEFAULT_VALUE = 1;
    console.log('--- Running Quality Job ---')

    let nodes = await getAllNodes();

    await asyncForEach(nodes, async (node) => {
      let qualityStartOfDay = currentDate.clone().startOf('day')
      let qualityEndOfDay = currentDate.clone().endOf('day')

      console.log(`Started inserting "quality" for ${node.name}`);
      let existingQuality = await new OEEQuality({node_id: node.id, start_time: qualityStartOfDay, end_time: qualityEndOfDay}).fetch({require: false})
      if (existingQuality) {
        existingQuality.set('value', OEE_AVAILABILITY_DEFAULT_VALUE)
        existingQuality.save()
      } else {
        await new OEEQuality({node_id: node.id, start_time: qualityStartOfDay, end_time: qualityEndOfDay, value: OEE_AVAILABILITY_DEFAULT_VALUE}).save()
      }
      console.log(`Completed inserting "quality" for ${node.name}`);
    })

    console.log('--- Completed Quality Job ---')
    resolve()
  })
}

let runOEEJob = async (currentDate) => {
  return new Promise(async(resolve, reject) => {
    console.log('--- Running OEE Job ---');

    let nodes = await getAllNodes();

    await asyncForEach(nodes, async (node) => {
      let startOfDay = currentDate.clone().startOf('day')
      let endOfDay = currentDate.clone().endOf('day')

      console.log(`Started inserting "OEE" for ${node.name}`);

      let availability = 0;
      let performance = 0;
      let quality = 0;

      // availability
      let availabilities = (await new OEEAvailability({node_id: node.id, start_time: startOfDay, end_time: endOfDay}).fetchAll()).toJSON();

      if (availabilities.length != 0) {
        availability = _.meanBy(availabilities, (a) => a.value)
      }


      let performances = (await new OEEPerformance({node_id: node.id, start_time: startOfDay, end_time: endOfDay}).fetchAll()).toJSON();
      if (performances.length != 0) {
        performance = _.meanBy(performances, (a) => a.value)
      }


      let qualities = (await new OEEQuality({node_id: node.id, start_time: startOfDay, end_time: endOfDay}).fetchAll()).toJSON();
      if (qualities.length != 0) {
        quality = _.meanBy(qualities, (a) => a.value)
      }


      let value = (availability * performance * quality);

      let existingOEE = await new OEE({node_id: node.id, start_time: startOfDay, end_time: endOfDay}).fetch({require: false})

      if (existingOEE) {
        existingOEE.set('value', value);
        existingOEE.set('availability_value', availability);
        existingOEE.set('performance_value', performance);
        existingOEE.set('quality_value', quality);
        existingOEE.save()
      } else {
        await new OEE({node_id: node.id, start_time: startOfDay, end_time: endOfDay, value, availability_value: availability, performance_value: performance, quality_value: quality}).save()
      }
      console.log(`Completed inserting "OEE" for ${node.name}`);
    })
    console.log('--- Completed OEE Job ---');
    resolve()
  })
}



let runAllJob = async (startTime) => {
  startTime.startOf('day');
  let today = moment();

  let dates = []

  while (startTime.isBefore(today)) {
    dates.push(startTime.clone())
    startTime.add(1, 'day')
  }
  asyncForEach(dates, async (date) => {
    console.log(date);
    await runAvailabilityJob(date);
    await runPerformanceJob(date);
    await runQualityJob(date);
    await runOEEJob(date);
  })
}

// schedule.scheduleJob('0 5 0 * * *', function() {
//   let date = moment().subtract(1, 'day')
//   runAllJob(date)
// })

let date = moment().subtract(3, 'day')
runAllJob(date)
