const rootPath = './../../..'

const _ = require('lodash')
const moment = require('moment')

const {
    asyncForEach
} = require(`${rootPath}/app/helpers/loop`)

const bookshelf = require(`${rootPath}/config/bookshelf`)

const Node = require(`${rootPath}/app/models/Node/Node`)
const NodeGroup = require(`${rootPath}/app/models/Node/NodeGroup`)
const OEEAvailability = require(`${rootPath}/app/models/OEE/NodeGroup/OEEAvailability`)
const OEEPerformance = require(`${rootPath}/app/models/OEE/NodeGroup/OEEPerformance`)
const OEENodePerformance = require(`${rootPath}/app/models/OEE/OEEPerformance`)
const OEENodeQuality = require(`${rootPath}/app/models/OEE/OEEQuality`)

const { isAM } = require(`${rootPath}/config/app-settings`)

const OEEHelper = require(`${rootPath}/app/helpers/oee`)

const DATE_FORMAT = 'YYYY-MM-DD'
const OEE_AVAILABILITY_DEFAULT_VALUE = 1
const OEE_DEFAULT_QUALITY_VALUE = 1

let nodeGroupCache = {}
let allNodeGroupsCache = null

// get all node groups
let getAllNodeGroups = async () => {
    if (allNodeGroupsCache) {
        return allNodeGroupsCache
    }
    allNodeGroups = (await new NodeGroup().fetchAll({withRelated: ['nodes']})).toJSON();
    return allNodeGroups;
}

let getNodesByGroupId = async (nodeGroupId) => {
    let cachedNodeGroup = nodeGroupCache[nodeGroupId]
    if (cachedNodeGroup) {
        return cachedNodeGroup
    }

    let nodeGroup = await new Node().query(qb => qb.where('node_group_id', nodeGroupId)).fetchAll()
    nodeGroup = nodeGroup.toJSON()

    nodeGroupCache[nodeGroupId] = nodeGroup

    return nodeGroup
}

/****************
 * Availability *
 ****************/
let runAvailabilityJob = async (currentDate) => {
    let nodeGroups = await getAllNodeGroups()
    let formattedDate = currentDate.format(DATE_FORMAT)

    await asyncForEach(nodeGroups, async (nodeGroup) => {
        console.log(`Started Inserting "availability" for ${formattedDate} - ${nodeGroup.name}`)

        let value = await runSingleNodeAvailabilityJob(nodeGroup.id, currentDate)

        console.log(`Completed Inserting "availability" for ${formattedDate} - ${nodeGroup.name} => ${value}`)
    })
}

let runSingleNodeAvailabilityJob = async (nodeGroupId, currentDate) => {
    console.log(`Started Inserting "availability" for node with Group ID - ${nodeGroupId}`)

    let value = await getAvailabilityValue(nodeGroupId, currentDate)
    let availabilityStartOfDay = currentDate.clone().startOf('day')
    let availabilityEndOfDay = currentDate.clone().endOf('day')

    // get the existing or create new record
    // insert record
    let existingAvailability = await new OEEAvailability({
        node_group_id: nodeGroupId,
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
            node_group_id: nodeGroupId,
            start_time: availabilityStartOfDay,
            end_time: availabilityEndOfDay,
            value: value
        }).save()
    }


    console.log(`Completed Inserting "availability" for node with Group ID - ${nodeGroupId}`)

    return value
}

let getAvailabilityValue = async (nodeGroupId, currentDate) => {
    let nodes = await getNodesByGroupId(nodeGroupId)

    let result = []
    for (var i = 0; i < nodes.length; i++) {
        let node = nodes[i]
        let value = await OEEHelper.getAvailabilityValue(node.id, currentDate)
        result.push(value)
    }

    return _.mean(result)
}

/***************
 * Performance *
 ***************/
let runPerformanceJob = async (currentDate) => {
    let nodeGroups = await getAllNodeGroups()
    let formattedDate = currentDate.format(DATE_FORMAT)

    await asyncForEach(nodeGroups, async (nodeGroup) => {
        console.log(`Started Inserting "performance" for ${formattedDate} - ${nodeGroup.name}`)

        await runSingleNodePerformanceJob(nodeGroup.id, currentDate)


        console.log(`Completed Inserting "performance" for ${formattedDate} - ${nodeGroup.name}`)
    })
}

let runSingleNodePerformanceJob = async (nodeGroupId, currentDate) => {
    console.log(`Started Inserting "performance" for node with Group ID - ${nodeGroupId}`)

    let performanceStartOfDay = currentDate.clone().startOf('day')
    let performanceEndOfDay = currentDate.clone().endOf('day')
    let times = OEEHelper.getTimeslotBetween(performanceStartOfDay, performanceEndOfDay)

    // get the values for each individual nodes
    // combine them together
    await asyncForEach(times, async time => {
        let { startTime, endTime } = time
        let isoFormattedStartTime = startTime.toISOString();
        let isoFormattedEndTime = endTime.toISOString();
        let value = await getPerformanceValue(nodeGroupId, time.startTime, time.endTime)
        let existingOEEPerformance = await new OEEPerformance({node_group_id: nodeGroupId, start_time: isoFormattedStartTime, end_time: isoFormattedEndTime}).fetch({require: false})

        if (existingOEEPerformance) {
          existingOEEPerformance.set('value', value);
          // existingOEEPerformance.set('value_breakdown', value_breakdown);
          // existingOEEPerformance.set('events_breakdown', events_breakdown);
          existingOEEPerformance.save();
        } else {
          await new OEEPerformance({
            node_group_id: nodeGroupId,
            start_time: isoFormattedStartTime,
            end_time: endTime,
            // events_breakdown: events_breakdown,
            // value_breakdown: value_breakdown,
            value: value,
          }).save();
        }
        console.log(`Completed Inserting "performance" for node with Group ID - ${nodeGroupId} ${isoFormattedStartTime} <> ${isoFormattedEndTime} => ${value}`)
    })
    console.log(`Completed Inserting "performance" for node with Group ID - ${nodeGroupId}`)

    // return value
}

let getPerformanceValue = async (nodeGroupId, startTime, endTime) => {

    // startTime = moment(startTime)
    // endTime = moment(endTime)
    const DEFAULT_PERFORMANCE_VALUE = 1

    let nodes = await getNodesByGroupId(nodeGroupId)
    let result = []
    await asyncForEach(nodes, async node => {
        let nodeResult = await OEENodePerformance.findOrCreateRecord(node.id, startTime, endTime)
        result.push(nodeResult['value'] || DEFAULT_PERFORMANCE_VALUE)
    })

    return _.mean(result)
}

/***********
 * Quality *
 ***********/
let runQualityJob = async (currentDate) => {
    let nodeGroups = await getAllNodeGroups()

    await asyncForEach(nodeGroups, async (nodeGroup) => {
        await runSingleNodeQualityJob(nodeGroup.id, currentDate)
    })
}

let runSingleNodeQualityJob = async (nodeGroupId, currentDate) => {
    console.log(`Started Inserting "quality" for node with Group ID - ${nodeGroupId}`)

    let value = await getQualityValue(nodeGroupId, currentDate)

    console.log(`Completed Inserting "quality" for node with Group ID - ${nodeGroupId}`)
}

let getQualityValue = async(nodeGroupId, currentDate) => {

    let nodes = await getNodesByGroupId(nodeGroupId)

    let nodeIds = _.map(nodes, 'id')

    let qualityQuery = OEENodeQuality.amSiteQualityQuery(nodeIds)
    if (isAM()) {
      qualityQuery = OEEQuality.bwSiteQualityQuery(nodeIds)
    }
    let formattedDate = currentDate.clone().format('YYYY-MM-DD')

    let result = (await bookshelf.knex.raw(qualityQuery, [formattedDate, ...nodeIds])).rows;
    // NOTE: default set as 100%
    let value = OEE_DEFAULT_QUALITY_VALUE
    if (!result.length) {
      value = 0
    } else {
      value = result[0].value
    }
    // ensure it don't get more than 100%
    if (value > 1) {
      value = 1
    }

    return value
}

let runOEEJob = async (currentDate) => {
    console.log('--- Running OEE Job ---');

    // await runAvailabilityJob(currentDate)
    // await runPerformanceJob(currentDate)
    await runQualityJob(currentDate)

    console.log('--- Completed OEE Job ---');
}


module.exports = {
    runAvailabilityJob,
    runPerformanceJob,
    runQualityJob,
    runOEEJob,
}
