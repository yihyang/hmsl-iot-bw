const rootPath = './../..'

const moment = require('moment')
const _ = require('lodash')

const { isAM } = require(`${rootPath}/config/app-settings`)
const {
    asyncForEach
} = require(`${rootPath}/app/helpers/loop`)

const bookshelf = require(`${rootPath}/config/bookshelf`);

const Event = require(`${rootPath}/app/models/Node/Event`)
const Gwo = require(`${rootPath}/app/models/Gwo/Gwo`)
const Node = require(`${rootPath}/app/models/Node/Node`)
const NodeDailyInput = require(`${rootPath}/app/models/OEE/NodeDailyInput`)
const NodeDefaultValue = require(`${rootPath}/app/models/OEE/NodeDefaultValue`)
const OEE = require(`${rootPath}/app/models/OEE/OEE`)
const OEEAvailability = require(`${rootPath}/app/models/OEE/OEEAvailability`)
const OEEPerformance = require(`${rootPath}/app/models/OEE/OEEPerformance`)
const OEEQuality = require(`${rootPath}/app/models/OEE/OEEQuality`)
const OEECapacity = require(`${rootPath}/app/models/OEE/OEECapacity`)
const PoRecord = require(`${rootPath}/app/models/PoRecord/PoRecord`)

const DEFAULT_AVAILABILITY = 12
const OEE_DEFAULT_QUALITY_VALUE = 1
const DATE_FORMAT = 'YYYY-MM-DD'

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
        let formattedDate = currentDate.format(DATE_FORMAT)
        let nodes = await getAllNodes();
        await asyncForEach(nodes, async (node) => {
            console.log(`Started Inserting "availability" for ${formattedDate} - ${node.name}`)

            let value = await runSingleNodeAvailabilityJob(node.id, currentDate)

            console.log(`Completed Inserting "availability" for ${formattedDate} - ${node.name} => ${value}`)
        })
        console.log('--- Completed Availability Job ---')
        resolve()
    })
}

let runSingleNodeAvailabilityJob = async function(nodeId, currentDate) {
    if (!nodeId) {
        console.log('OEEHelper.runSingleNodePerformanceJob - invalid nodeId provided')
    }

    console.log(`Started Inserting "availability" for node with ID - ${nodeId}`)
    let value = await getAvailabilityValue(nodeId, currentDate)
    let availabilityStartOfDay = currentDate.clone().startOf('day')
    let availabilityEndOfDay = currentDate.clone().endOf('day')

    // get the
    // insert record
    let existingAvailability = await new OEEAvailability({
        node_id: nodeId,
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
            node_id: nodeId,
            start_time: availabilityStartOfDay,
            end_time: availabilityEndOfDay,
            value: value
        }).save()
    }

    console.log(`Completed Inserting "availability" for node with ID - ${nodeId}`)

    return value
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
    let value = await getAvailabilityValue(node_id, moment(start_time))
    existingAvailability.set('value', value)
    existingAvailability.set('need_rework', false)
    console.log(`Updated availability ID - ${id} - new value - ${value}`)
    await existingAvailability.save()
}

let getAvailabilityValue = async (nodeId, currentDate) => {
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

    let defaultValueObject = await NodeDefaultValue.getDefaultValueObject(nodeId)
    let defaultAmAvailability = defaultValueObject.am_availability
    let defaultPmAvailability = defaultValueObject.pm_availability

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
            am_availability: defaultAmAvailability,
            pm_availability: defaultPmAvailability
        }).save();
        value = defaultAmAvailability + defaultPmAvailability;
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

/************/
/* capacity */
/************/
let runSingleNodeCapacityJob = async(nodeId, currentDate) => {
  //
  console.log(`Started Inserting "capacity" for node with ID ${nodeId} - ${currentDate}`)

  // get default value object
  let defaultValueObject = await NodeDefaultValue.getDefaultValueObject(nodeId)

    let value = await getCapacityValue(nodeId, currentDate, defaultValueObject)
    console.log(value)
    let capacityStartOfDay = currentDate.clone().startOf('day')
    let capacityEndOfDay = currentDate.clone().endOf('day')

    // insert record
    let existingCapacity = await new OEECapacity({node_id: nodeId, start_time: capacityStartOfDay, end_time: capacityEndOfDay}).fetch({require: false})
    if (existingCapacity) {
      existingCapacity.set('value', value)
      await existingCapacity.save()
    } else {
      await new OEECapacity({
        node_id: nodeId,
        start_time: capacityStartOfDay,
        end_time: capacityEndOfDay,
        value: value
      }).save()
    }

  console.log(`Completed Inserting "capacity" for node with ID ${nodeId} - ${currentDate}`)
}

let getCapacityValue = async (nodeId, currentDate, defaultValueObject) => {
  // get the daily input values
  let dailyValue = await getAndSetDailyTimeInput(nodeId, currentDate, defaultValueObject)

  let {
      am_capacity,
      pm_capacity
  } = dailyValue.attributes;
  let value = (am_capacity || defaultValueObject.am_capacity) + (pm_capacity || defaultValueObject.pm_capacity);
  //
  // value = (HOUR_PER_SHIFT - capacity) / HOUR_PERS_SHIFT
  // e.g.     (12 - 1) / 12 = 91.67%
  // NOTE: removed on 7th Dec 2021
  // let amValue = (HOUR_PER_SHIFT - am_capacity) / HOUR_PER_SHIFT
  // let pmValue = (HOUR_PER_SHIFT - pm_capacity) / HOUR_PER_SHIFT

  // return _.mean([amValue, pmValue])

  // UPDATE 7th Dec 2021
  // am + pm / 24
  return value / 24
}

let runCapacityJob = async (currentDate) => {
  return new Promise(async(resolve, reject) => {
    console.log('--- Running Capacity Job ---')
    let nodes = await getAllNodes();

    await asyncForEach(nodes, async (node) => {
      await runSingleNodeCapacityJob(node.id, currentDate)
    })

    console.log('--- Completed Capacity Job ---')

    resolve()
  })
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
            await runSingleNodePerformanceJob(node.id, currentDate)
            console.log(`Completed inserting "performance" for ${node.name}`);
        })
        console.log('--- Completed Performance Job ---')
        resolve()
    })
}

let runSingleNodePerformanceJob = async (nodeId, currentDate) => {
    if (!nodeId) {
        console.log('OEEHelper.runSingleNodePerformanceJob - invalid nodeId provided')
    }
    let performanceStartOfDay = currentDate.clone().startOf('day')
    let performanceEndOfDay = currentDate.clone().endOf('day')

    let times = getTimeslotBetween(performanceStartOfDay, performanceEndOfDay)

    await asyncForEach(times, async time => {
        await OEEPerformance.insertHourSummaryV2(nodeId, time.startTime, time.endTime)
        console.log(`Completed inserting "performance" for node with ID ${nodeId}`);
    })
}

let reworkPerformance = async (id) => {
    let existingPerformance = await new OEEPerformance({
        id
    }).fetch({
        require: false
    })
    await OEEPerformance.insertHourSummaryV2(existingPerformance.node_id, existingPerformance.start_time, time.end_time)

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

            let value = await getQualityValue(currentDate, node.id)
            // query end
            console.log(`Started inserting "quality" for ${node.name} - ${value}`);
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

let getQualityValue = async (currentDate, nodeId) => {
    // if AM: take ended PO output / input
    //  else: take input / output of previous date

    // BW
    let qualityQuery = OEEQuality.amSiteQualityQuery([nodeId])

    if (isAM()) {
      qualityQuery = OEEQuality.bwSiteQualityQuery([nodeId])
    }
    let formattedDate = currentDate.clone().format('YYYY-MM-DD')
    let result = (await bookshelf.knex.raw(qualityQuery, [formattedDate, nodeId])).rows;
    // NOTE: default set as 100%
    let value = OEE_DEFAULT_QUALITY_VALUE
    if (result.length) {
      value = result[0].value
    }
    // ensure it don't get more than 100%
    if (value > 1) {
      value = 1
    }

    return value
}

let runOEEJob = async (currentDate) => {
    return new Promise(async (resolve, reject) => {
        console.log('--- Running OEE Job ---');
        let nodes = await getAllNodes();
        await asyncForEach(nodes, async (node) => {
            console.log(`Started inserting "OEE" for ${node.name} - ${currentDate}`);

            let { oee } = await runSingleNodeOEEJob(node.id, currentDate)
            console.log(`Completed inserting "OEE" for ${node.name} - ${currentDate}`);
        })
        console.log('--- Completed OEE Job ---');
        resolve()
    })
}

let runSingleNodeOEEJob = async function(nodeId, currentDate) {
    let {oee, availability, performance, quality, oee2, capacity} = await getOEEValue(nodeId, currentDate)
    let startOfDay = currentDate.clone().startOf('day')
    let endOfDay = currentDate.clone().endOf('day')
    let existingOEE = await new OEE({
        node_id: nodeId,
        start_time: startOfDay,
        end_time: endOfDay
    }).fetch({
        require: false
    })

    if (existingOEE) {
        existingOEE.set('oee2', oee2);
        existingOEE.set('capacity_value', capacity);
        existingOEE.set('value', oee);
        existingOEE.set('availability_value', availability);
        existingOEE.set('performance_value', performance);
        existingOEE.set('quality_value', quality);
        existingOEE.save()
    } else {
        await new OEE({
            node_id: nodeId,
            start_time: startOfDay,
            end_time: endOfDay,
            value: oee,
            availability_value: availability,
            performance_value: performance,
            quality_value: quality,
            oee2: oee2,
            capacity_value: capacity,
        }).save()
    }

    return {
        oee,
        availability,
        performance,
        quality,
    }
}

let getOEEValue = async (nodeId, currentDate) => {
      let startOfDay = currentDate.clone().startOf('day')
      let endOfDay = currentDate.clone().endOf('day')
      let formattedStartOfDay = startOfDay.toISOString()
      let formattedEndOfDay = endOfDay.toISOString()

      console.log(`Started inserting "OEE" for NODE ID -  ${nodeId}`)

      let availability = 0;
      let performance = 0;
      let capacity = 0;
      let quality = OEE_DEFAULT_QUALITY_VALUE;

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

      // performances
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

      // qualities
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

      // capacities
      console.log('----- capacities -----');
      let capacities = (await new OEECapacity()
        .query(function (qb) {
          qb.where('node_id', '=', nodeId)
            .where('start_time', '>=', formattedStartOfDay)
            .where('end_time', '<=', formattedEndOfDay)
        })
        .fetchAll()
      ).toJSON();

      if (capacities.length != 0) {
        capacity = _.meanBy(capacities, (a) => a.value)
      }
      console.log(capacity);

      let oee = availability * performance * quality

      return {
        availability,
        capacity,
        performance,
        quality,
        oee: oee,
        oee2: capacity * oee,
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
    let {oee} = await getOEEValue(node_id, moment(start_time))

    existingOEE.set('value', oee)
    existingOEE.set('need_rework', false)
    console.log(`Updated OEE ID - ${id}`)
    await existingOEE.save()
}

let setNullDailyTimeInputValue = async (dailyValue, defaultValueObject) => {
  let {
    am_availability,
    pm_availability,
    am_capacity,
    pm_capacity,
  } = dailyValue.attributes;

  // NOTE: have to return early if value already exists
  //       otherwise it will cause endless loop in rerun_daily_time_input
  if (am_availability != null &&
      pm_availability != null &&
      am_capacity != null &&
      pm_capacity != null) {
    return dailyValue
  }

  // availability
  if (am_availability == null) {
    dailyValue.set('am_availability', defaultValueObject.am_availability)
  }
  if (pm_availability == null) {
    dailyValue.set('pm_availability', defaultValueObject.pm_availability)
  }
  // capacity
  if (am_capacity == null) {
    dailyValue.set('am_capacity', defaultValueObject.am_capacity)
  }
  if (pm_capacity == null) {
    dailyValue.set('pm_capacity', defaultValueObject.pm_capacity)
  }
  await dailyValue.save()

  return dailyValue
}

let getAndSetDailyTimeInput = async (nodeId, currentDate, defaultValueObject) => {
    let currentFormattedDate = currentDate.clone().format('YYYY-MM-DD');
    let dailyValue = (await new NodeDailyInput({
        node_id: nodeId,
        date: currentFormattedDate
    }).fetch({
        require: false
    }));

    if (dailyValue) {
        dailyValue = await setNullDailyTimeInputValue(dailyValue, defaultValueObject);
        let {
            am_availability,
            pm_availability,
            am_capacity,
            pm_capacity,
        } = dailyValue.attributes;
    } else {
        // insert default values if not found
        dailyValue = await new NodeDailyInput({
            node_id: nodeId,
            date: currentFormattedDate,
            am_availability: defaultValueObject.am_availability,
            pm_availability: defaultValueObject.pm_availability,
            am_capacity: defaultValueObject.am_capacity,
            pm_capacity: defaultValueObject.pm_capacity,
        }).save();
    }

    return dailyValue
}

let runAllJob = async (startTime) => {
    await runAvailabilityJob(startTime);
    await runPerformanceJob(startTime);
    await runQualityJob(startTime);
    await runOEEJob(startTime);
    await runCapacityJob(startTime)
    // startTime.startOf('day');
    // let today = moment().startOf('day');
    // let dates = []
    // while (startTime.isBefore(today)) {
    //     dates.push(startTime.clone())
    //     // console.log(startTime, today)
    //     startTime.add(1, 'day')
    // }

    // asyncForEach(dates, async (date) => {
    //     console.log('Running OEE Job: ' + date.format());
    // })
}

let getTimeslotBetween = (startTime, endTime) => {
    let currentTime = startTime.clone()
    let times = [];
    while (currentTime.isBefore(endTime)) {
        times.push({
            startTime: currentTime.clone(),
            endTime: currentTime.clone().endOf('hour')
        });
        currentTime = currentTime.add(1, 'hour');
    }
    return times
}

module.exports = {
    runAllJob,
    runOEEJob,
    runSingleNodeOEEJob,
    runPerformanceJob,
    runAvailabilityJob,
    runCapacityJob,
    runQualityJob,
    runSingleNodeAvailabilityJob,
    runSingleNodeCapacityJob,
    runSingleNodePerformanceJob,
    getAvailabilityValue,
    reworkAvailability,
    reworkOEE,
    getTimeslotBetween,
}
// let date = moment().subtract(3, 'day')
// runAllJob(date)
