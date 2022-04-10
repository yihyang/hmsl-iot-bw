require('dotenv').config()

const NodeCache = require( "node-cache" )
const express = require('express');
const moment = require('moment');
const schedule = require('node-schedule');
const axios = require('axios');
const _ = require('lodash');
const io = require('socket.io-client')

const Node = require('./app/models/Node/Node');
const Event = require('./app/models/Node/Event');

const {
  asyncForEach
} = require('./app/helpers/loop');
const {
  timeLogger
} = require('./app/helpers/express');


const {
  SOCKET_IO_HOST
} = process.env;
let socket = io.connect(SOCKET_IO_HOST);

const nodeUpdateLockCache = new NodeCache();

const TIMEOUT_PERIOD = 5000

const {
  CATCHER_USERNAME,
  CATCHER_PASSWORD,
  NODE_USERNAME,
  NODE_PASSWORD,
} = process.env;

let nodeEventsCache = {} // catch last event for a particular node
// NOTE: HMSL all uses pull + push mechanism to fetch data
let nodesPullPushCache = []
let nodesPullPushCacheByMacAddress = {}

async function prepareNodeCache() {
  // pull push cache
  nodesPullPushCache = (await new Node().fetchAll()).toJSON();
  nodesPullPushCacheByMacAddress = _.reduce(nodesPullPushCache, (carry, item) => {

    if (!item.mac_address) {
      return carry
    }
    carry[item.mac_address] = item

    return carry
  }, {})

  console.log(`[${moment()}] Found ${nodesPullPushCache.length} pull push nodes`)

  startServer()
}

prepareNodeCache()

function statusMapper(rawData) {
  switch (rawData) {
    case '0010':
      return 'RUNNING';
    case '1000':
      return 'STOPPED';
    default:
      return 'UNKNOWN';
  }
}

async function insertNewEvent(nodeId, method, status, rawData) {
  console.log(`Insert New event ${status} to node with ID: ${nodeId}`);

  return new Event({
    node_id: nodeId,
    start_time: moment(),
    status: status,
    raw_data: rawData,
    start_time_fetch_method: method,
    record_status: Event.RECORD_STATUS_IN_PROGRESS,
  }).save();
}

async function updateEventEndTime(eventId, method) {
  let event = await new Event().query(qb => qb.where('id', eventId)).fetch()
  let currentTime = moment();
  console.log(`Set event ${event.id} end time to ${currentTime}`);
  event.set('duration', currentTime.diff(moment(event.attributes.start_time), 'seconds'))
  event.set('end_time', currentTime);
  event.set('end_time_fetch_method', method);
  event.set('record_status', Event.RECORD_STATUS_COMPLETED);
  await event.save();
}

async function updateNodeCurrentStatus(nodeId, status) {
  console.log(`Update status ${status} to node with ID: ${nodeId}`);

  new Node({
    id: nodeId
  }).save({
    current_status: status,
  });
}

// async function processNodeStatus(node, method, status, rawData) {
//   let nodeCurrentEvent = node.current_event;
//   let nodeObject = node.toJSON();
//   nodeCurrentStatus = nodeObject.current_status;

//   let lastEvent = await new Event({
//     node_id: node.id
//   }).orderBy('id', 'DESC').fetch({
//     require: false
//   });
//   // not event existed insert first event
//   if (lastEvent === null) {
//     await updateNodeCurrentStatus(node.id, status);
//     await insertNewEvent(node.id, method, status, rawData);

//     return;
//   }

//   // same status, do nothing
//   if (nodeCurrentStatus == status) {
//     return;
//   }

//   // update event that has not been closed
//   if (lastEvent.end_time == null) {
//     updateEventEndTime(lastEvent, method);
//   }
//   await updateNodeCurrentStatus(node.id, status);
//   await insertNewEvent(node.id, method, status, rawData);
// }

// NOTE: rewrite on 24th Oct 2021
//       added cache handling in order to handle more nodes
//       and return DB query load
async function processNodeStatusUsingCache(node, method, status, rawData) {
  let nodeObject = node
  let nodeId = node.id
  let currentEvent = nodeEventsCache[nodeId]

  let lock = getLock(nodeId)

  if (lock) {
    console.log(`There was a write attempt within the same second, previous params:` + JSON.stringify(lock))
    return
  }
  setLock(nodeId, method, status, rawData)

  // last not exists in cache
  if (!currentEvent) {
    // fetch from DB
    let lastEvent = await new Event({
      node_id: node.id
    }).orderBy('id', 'DESC').fetch({
      require: false
    })
    // has no record at all (new machine)
    if (lastEvent === null) {
      await updateNodeCurrentStatus(nodeId, status);
      nodeEventsCache[nodeId] = (await insertNewEvent(nodeId, method, status, rawData)).toJSON();
      releaseLock(nodeId)
      return;
    }
    currentEvent = lastEvent.toJSON()
    nodeEventsCache[nodeId] = currentEvent
  }

  // same status as current event - do nothing
  if (currentEvent.status == status) {
    console.log(`[${moment()}] Node ID - ${nodeId } - ${node.name} - current event status is same as new status => ${status}`)
    releaseLock(nodeId)
    return
  }
  // update event that has not been closed
  if (currentEvent.end_time == null) {
    updateEventEndTime(currentEvent.id, method);
  }
  // update current status on node level
  // insert new event and update cache
  await updateNodeCurrentStatus(node.id, status);
  nodeEventsCache[nodeId] = (await insertNewEvent(node.id, method, status, rawData)).toJSON();

  // status updated, release lock
  releaseLock(nodeId)
}

// start server



const app = express()

app.use(timeLogger);

/**************************/
/* route for WISE to ping */
/**************************/
app.post('/io_log', function(req, res) {
  // authentication
  let header = req.headers['authorization'] || '', // get the header
    token = header.split(/\s+/).pop() || '', // and the encoded auth token
    auth = Buffer.from(token, 'base64').toString(), // convert from base64
    parts = auth.split(/:/), // split on colon
    username = parts[0],
    password = parts[1];

  if (CATCHER_USERNAME != username || CATCHER_PASSWORD != password) {
    res.setHeader('WWW-Authenticate', 'Basic realm="WISE Log Server"');
    return res.sendStatus(401);
  }

  let jsonData = '';
  req.on('data', function(data) {
    jsonData += data;
  });
  req.on('end', async function() {
    let data = JSON.parse(jsonData);
    let macAddress = data['MAC'];
    let node;
    node = nodesPullPushCacheByMacAddress[macAddress]

    if (!node) {
      console.log(`[${moment()}] [PUSH] Unable to find node with specified mac address: ${macAddress}`);

      res.sendStatus(200);
      return;
    }

    let record = data['Record'];
    let rawData = record.map((item) => {
      return item[3];
    }).join('');
    let sanitizedRawData = rawData.substr(0, 4);  // remove DO
    let status = statusMapper(sanitizedRawData);

    console.log(`[${moment()}] [PUSH] Node "${node.name}" (id: ${node.id}), status: ${status}, rawData: ${rawData}`);
    await processNodeStatusUsingCache(node, 'PUSH', status, sanitizedRawData);

    res.sendStatus(200);
  })
});

/***************************/
/* periodical ping to WISE */
/***************************/
async function periodicalPing(listName, nodes, timeout) {
  let nodesCount = nodes.length
  console.log(`[${moment()}] [PULL] [list - ${listName}] Pulling ${nodesCount} machine`);
  let options = {
    headers: {
      'Authorization': 'Basic ' + Buffer.from(NODE_USERNAME + ':' + NODE_PASSWORD).toString('base64')
    },
    timeout,
  }
  await asyncForEach(nodes, async function(jsonNode) {
    try {

      let url = 'http://' + jsonNode.ip_address + '/di_value/slot_0';

      let response = await axios.get(url, options);
      let rawData = response.data['DIVal'].map((item) => item['Val']).join('');
      let status = statusMapper(rawData);

      console.log(`[${moment()}] [PULL] Node "${jsonNode.name}" (id: ${jsonNode.id}), status: ${status}`);
      processNodeStatusUsingCache(jsonNode, 'PULL', status, rawData);
    } catch (e) {
      console.log(`ERROR - error while pinging node ${jsonNode.id} - ${jsonNode.name}`)
      // console.log(e)
    }
  });
}

/**********************
 * record update lock *
 **********************/
/**
 * Gets the lock.
 *
 * @param      int  nodeId  The node identifier
 * @return     mixed: object / undefined
 */
function getLock(nodeId) {
  // check whether the same node has been written within the last second
  let lockName = getLockName(nodeId)
  return nodeUpdateLockCache.get(lockName)
}

function setLock(nodeId, method, status, rawData)
{
  let lockName = getLockName(nodeId)
  let params = {nodeId, method, status, rawData}
  // set a lock for 1 second
  nodeUpdateLockCache.set(lockName, params, 1)
  catcherLog(`Event Update Lock set for node ID ${nodeId}`)
}

// release lock: used when DB writing ended
function releaseLock(nodeId) {
  let lockName = getLockName(nodeId)

  nodeUpdateLockCache.del(lockName)
  catcherLog(`Event Update Lock released for node ID ${nodeId}`)
}

function getLockName(nodeId) {
  return `node-${nodeId}-lock`
}

// TODO: improve this later with milliseconds
function catcherLog(message) {
  // let dateFormat = 'YYYY-MM-DD hh:mm:ss.SSSSSS'
  console.log(`[${moment()}] ${message}`)
}


function startServer() {
  const CATCHER_PORT_NUMBER = process.env.CATCHER_PORT_NUMBER || 8000
  // start server
  app.listen(CATCHER_PORT_NUMBER, function() {
    console.log(`Event Catcher Server started at Port ${CATCHER_PORT_NUMBER}`)
  })
  // periodical ping
  schedule.scheduleJob('0,10,20,30,40,50 * * * * *', () => {
    periodicalPing('pull_push', nodesPullPushCache, 5000)
  });
}
