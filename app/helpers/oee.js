const rootPath = './../..'
const moment = require('moment')
const Event = require(`${rootPath}/app/models/Node/Event`)
const Gwo = require(`${rootPath}/app/models/Gwo/Gwo`)
const Node = require(`${rootPath}/app/models/Node/Node`)
const _ = require('lodash')
const {
    asyncForEach
} = require(`${rootPath}/app/helpers/loop`)
const bookshelf = require(`${rootPath}/config/bookshelf`);
const NodeDailyInput = require(`${rootPath}/app/models/OEE/NodeDailyInput`)
const OEE = require(`${rootPath}/app/models/OEE/OEE`)
const OEEAvailability = require(`${rootPath}/app/models/OEE/OEEAvailability`)
const OEEPerformance = require(`${rootPath}/app/models/OEE/OEEPerformance`)
const OEEQuality = require(`${rootPath}/app/models/OEE/OEEQuality`)
const PoRecord = require(`${rootPath}/app/models/PoRecord/PoRecord`)
const DEFAULT_AVAILABILITY = 12
const DEFAULT_QUALITY_VALUE = 1
let getAllNodes = async () => {
    return new Promise(async (resolve, reject) => {
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
// set default values if it's not set
let runAvailabilityJob = async (currentDate) => {
    return new Promise(async (resolve, reject) => {
        console.log('--- Running Availability Job ---')
        let nodes = await getAllNodes();
        await asyncForEach(nodes, async (node) => {
            console.log(`Started Inserting "availability" for ${node.name}`)
            let value = await getAvailabilityValue(currentDate, node.id)
            let availabilityStartOfDay = currentDate.clone().startOf('day')
            let availabilityEndOfDay = currentDate.clone().endOf('day')

            // get the
            // insert record
            let existingAvailability = await new OEEAvailability({
                node_id: node.id,
                start_time: availabilityStartOfDay,
                end_time: availabilityEndOfDay
            }).fetch({
                require: false
            })
            if (existingAvailability) {
                existingAvailability.set('value', value)
                await existingAvailability.save()
            } else {
                await new OEEAvailability({
                    node_id: node.id,
                    start_time: availabilityStartOfDay,
                    end_time: availabilityEndOfDay,
                    value: value
                }).save()
            }
            console.log(`Completed Inserting "availability" for ${node.name} - ${value}`)
        })
        console.log('--- Completed Availability Job ---')
        resolve()
    })
}

let reworkAvailability = async (id) => {
    let existingAvailability = await new OEEAvailability({
        id
    }).fetch({
        require: false
    })
    let {
        start_time,
        node_id
    } = existingAvailability.attributes
    let value = await getAvailabilityValue(moment(start_time), node_id)
    existingAvailability.set('value', value)
    existingAvailability.set('need_rework', false)
    console.log(`Updated availability ID - ${id} - new value - ${value}`)
    await existingAvailability.save()
}

let getAvailabilityValue = async (currentDate, nodeId) => {
    let availabilityStartOfDay = currentDate.clone().startOf('day')
    let availabilityEndOfDay = currentDate.clone().endOf('day')
    // set the values
    let currentFormattedDate = currentDate.clone().format('YYYY-MM-DD');
    let dailyValue = (await new NodeDailyInput({
        node_id: nodeId,
        date: currentFormattedDate
    }).fetch({
        require: false
    }));

    // availability = hour in day -
    // get GWO events
    let duration = await Gwo.getOverlappedGWODuration(nodeId, availabilityStartOfDay, availabilityEndOfDay)
    // calculate the GWO times

    if (dailyValue) {
        let {
            am_availability,
            pm_availability
        } = dailyValue.attributes;
        value = (am_availability || 0) + (pm_availability || 0);
    } else {
        // insert default values if not found
        await new NodeDailyInput({
            node_id: nodeId,
            date: currentFormattedDate,
            am_availability: DEFAULT_AVAILABILITY,
            pm_availability: DEFAULT_AVAILABILITY
        }).save();
        value = DEFAULT_AVAILABILITY * 2;
    }
    // convert value to seconds
    let availableTime = (value * 3600)
    numerator = (availableTime) - duration
    let oneDayInSeconds = 24 * 3600

    value = (numerator / oneDayInSeconds)

    if (value < 0) {
        value = 0
    } else if (value > 1) {
        value = 1
    }

    return value;
}
/***************/
/* performance */
/***************/
let runPerformanceJob = async (currentDate) => {
    return new Promise(async (resolve, reject) => {
        console.log('--- Running Performance Job ---')
        let nodes = await getAllNodes();
        await asyncForEach(nodes, async (node) => {
            console.log(`Started inserting "performance" for ${node.name}`);
            let performanceStartOfDay = currentDate.clone().startOf('day')
            let performanceEndOfDay = currentDate.clone().endOf('day')
            let currentTime = performanceStartOfDay.clone()
            let times = [];
            while (currentTime.isBefore(performanceEndOfDay)) {
                times.push({
                    startTime: currentTime.clone(),
                    endTime: currentTime.clone().endOf('hour')
                });
                currentTime = currentTime.add(1, 'hour');
            }
            await asyncForEach(times, async time => {
                await asyncForEach(nodes, async node => {
                    await OEEPerformance.calculateHourSummary(node.id, time.startTime, time.endTime)
                    console.log(`Completed inserting "performance" for ${node.name} - ${time.startTime}`);
                })
            })
            console.log(`Completed inserting "performance"`);
        })
        console.log('--- Completed Performance Job ---')
        resolve()
    })
}

let reworkPerformance = async (id) => {
    let existingPerformance = await new OEEPerformance({
        id
    }).fetch({
        require: false
    })
    await OEEPerformance.calculateHourSummary(existingPerformance.node_id, existingPerformance.start_time, time.end_time)

    existingPerformance.set('need_rework', false)
    existingPerformance.save()

    console.log("Completed reworkPerformance for ID - " + id)
}

/***********/
/* quality */
/***********/
let runQualityJob = async (currentDate) => {
    return new Promise(async (resolve, reject) => {
        const OEE_AVAILABILITY_DEFAULT_VALUE = 1;
        console.log('--- Running Quality Job ---')
        let nodes = await getAllNodes();
        await asyncForEach(nodes, async (node) => {
            let qualityStartOfDay = currentDate.clone().startOf('day')
            let qualityEndOfDay = currentDate.clone().endOf('day')
            // calculate OEE Quality value
            // await new PoRecord().query((qb) => {
            //   qb.where('created_at', '>=', qualityStartOfDay)
            //     .where('created_at', '<=', qualityEndOfDay)
            // }).fetchAll()
            let formattedDate = currentDate.clone().format('YYYY-MM-DD')
            let qualityQuery = `
      SELECT
        CASE
          WHEN sum(input_quantity) = 0 THEN 0
          ELSE sum(produced_quantity) / sum(input_quantity)
        END AS value,
          date(created_at) FROM po_jobs
        WHERE date(created_at) = ?
        AND node_id = ?
        GROUP BY date(created_at)
      `
            let result = (await bookshelf.knex.raw(qualityQuery, [formattedDate, node.id])).rows;
            // NOTE: default set as 100%
            let value = DEFAULT_QUALITY_VALUE
            if (result.length != 0) {
                value = result[0].value
            }
            // ensure it don't get more than 100%
            if (value > 1) {
                value = 1
            }
            // query end
            console.log(`Started inserting "quality" for ${node.name}`);
            let existingQuality = await new OEEQuality({
                node_id: node.id,
                start_time: qualityStartOfDay,
                end_time: qualityEndOfDay
            }).fetch({
                require: false
            })
            if (existingQuality) {
                existingQuality.set('value', value)
                existingQuality.save()
            } else {
                await new OEEQuality({
                    node_id: node.id,
                    start_time: qualityStartOfDay,
                    end_time: qualityEndOfDay,
                    value: value
                }).save()
            }
            console.log(`Completed inserting "quality" for ${node.name}`);
        })
        console.log('--- Completed Quality Job ---')
        resolve()
    })
}
let runOEEJob = async (currentDate) => {
    return new Promise(async (resolve, reject) => {
        console.log('--- Running OEE Job ---');
        let nodes = await getAllNodes();
        await asyncForEach(nodes, async (node) => {
            let {oee, availability, performance, quality} = await getOEEValue(currentDate, node.id)
            let startOfDay = currentDate.clone().startOf('day')
            let endOfDay = currentDate.clone().endOf('day')
            let existingOEE = await new OEE({
                node_id: node.id,
                start_time: startOfDay,
                end_time: endOfDay
            }).fetch({
                require: false
            })
            if (existingOEE) {
                existingOEE.set('value', oee);
                existingOEE.set('availability_value', availability);
                existingOEE.set('performance_value', performance);
                existingOEE.set('quality_value', quality);
                existingOEE.save()
            } else {
                await new OEE({
                    node_id: node.id,
                    start_time: startOfDay,
                    end_time: endOfDay,
                    value: oee,
                    availability_value: availability,
                    performance_value: performance,
                    quality_value: quality
                }).save()
            }
            console.log(`Completed inserting "OEE" for ${node.name} - ${currentDate} - ${oee}`);
        })
        console.log('--- Completed OEE Job ---');
        resolve()
    })
}
let getOEEValue = async (currentDate, nodeId) => {
      let startOfDay = currentDate.clone().startOf('day')
      let endOfDay = currentDate.clone().endOf('day')
      let formattedStartOfDay = startOfDay.toISOString();
      let formattedEndOfDay = endOfDay.toISOString();

      console.log(`Started inserting "OEE" for NODE ID -  ${nodeId}`);

      let availability = 0;
      let performance = 0;
      let quality = DEFAULT_QUALITY_VALUE;

      // availability
      let availabilities = (await new OEEAvailability()
        .query(function (qb) {
          qb.where('node_id', '=', nodeId)
            .where('start_time', '>=', formattedStartOfDay)
            .where('end_time', '<=', formattedEndOfDay)
        })
        .fetchAll()
      ).toJSON();

      console.log('----- availabilities -----');
      if (availabilities.length != 0) {
        availability = _.meanBy(availabilities, (a) => a.value)
      }
      console.log(availability);


      console.log('----- performances -----');
      let performances = (await new OEEPerformance()
        .query(function (qb) {
          qb.where('node_id', '=', nodeId)
            .where('start_time', '>=', formattedStartOfDay)
            .where('end_time', '<=', formattedEndOfDay)
        })
        .fetchAll()).toJSON();
      if (performances.length != 0) {
        performance = _.meanBy(performances, (a) => a.value)
      }
      console.log(performance)

      console.log('----- qualities -----');
      let qualities = (await new OEEQuality()
        .query(function (qb) {
          qb.where('node_id', '=', nodeId)
            .where('start_time', '>=', formattedStartOfDay)
            .where('end_time', '<=', formattedEndOfDay)
        })
        .fetchAll()).toJSON();
      if (qualities.length != 0) {
        quality = _.meanBy(qualities, (a) => a.value)
      }
      console.log(quality)

      return {
        availability,
        performance,
        quality,
        oee: (availability * performance * quality)
      }
}

let reworkOEE = async (id) => {
  let existingOEE = await (new OEE().query(((qb) => {
    qb.where('id', id)
  })).fetch())

  let {
        start_time,
        node_id
    } = existingOEE.attributes
    let {oee} = await getOEEValue(moment(start_time), node_id)

    existingOEE.set('value', oee)
    existingOEE.set('need_rework', false)
    console.log(`Updated OEE ID - ${id}`)
    await existingOEE.save()
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
module.exports = {
    runAllJob,
    runOEEJob,
    runPerformanceJob,
    runQualityJob,
    runAvailabilityJob,
    reworkAvailability,
    reworkOEE
}
// let date = moment().subtract(3, 'day')
// runAllJob(date)
