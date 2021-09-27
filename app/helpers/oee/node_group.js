const rootPath = './../../..'

const _ = require('lodash')

const {
    asyncForEach
} = require(`${rootPath}/app/helpers/loop`)

const Node = require(`${rootPath}/app/models/Node/Node`)
const NodeGroup = require(`${rootPath}/app/models/Node/NodeGroup`)
const OEEAvailability = require(`${rootPath}/app/models/OEE/NodeGroup/OEEAvailability`)

const { isAM } = require(`${rootPath}/config/app-settings`)

const OEEHelper = require(`${rootPath}/app/helpers/oee`)

const DATE_FORMAT = 'YYYY-MM-DD'

let nodeGroupCache = {}

// get all node groups
let getAllNodeGroups = async () => {
    let allNodeGroups = (await new NodeGroup().fetchAll({withRelated: ['nodes']})).toJSON();
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
    let availabilityStartOfDay = currentDate.clone().startOf('day')
    let availabilityEndOfDay = currentDate.clone().endOf('day')

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

}

/***********
 * Qualtiy *
 ***********/
let runQualityJob = async (currentDate) => {

}

let runOEEJob = async (currentDate) => {
    console.log('--- Running OEE Job ---');

    await runAvailabilityJob(currentDate)

    console.log('--- Completed OEE Job ---');
}


module.exports = {
    runAvailabilityJob,
    runPerformanceJob,
    runQualityJob,
    runOEEJob,
}
