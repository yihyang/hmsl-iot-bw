const Node = require('./app/models/Node/Node');
const Event = require('./app/models/Node/Event');
const express = require('express');
const moment = require('moment');
const schedule = require('node-schedule');
const axios = require('axios');
const {
  asyncForEach
} = require('./app/helpers/loop');
const {
  timeLogger
} = require('./app/helpers/express');

const io = require('socket.io-client')

const {
  SOCKET_IO_HOST
} = process.env;
let socket = io.connect(SOCKET_IO_HOST);


require('dotenv').config();

const {
  CATCHER_USERNAME,
  CATCHER_PASSWORD,
  NODE_USERNAME,
  NODE_PASSWORD,
} = process.env;



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

  new Event({
    node_id: nodeId,
    start_time: moment(),
    status: status,
    raw_data: rawData,
    start_time_fetch_method: method,
  }).save();
}

async function updateEventEndTime(event, method) {
  let currentTime = moment();
  console.log(`Set event ${event.id} end time to ${currentTime}`);

  event.set('end_time', currentTime);
  event.set('end_time_fetch_method', method);
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

async function processNodeStatus(node, method, status, rawData) {
  let nodeCurrentEvent = node.current_event;
  let nodeObject = node.toJSON();
  nodeCurrentStatus = nodeObject.current_status;

  let lastEvent = await new Event({
    node_id: node.id
  }).orderBy('id', 'DESC').fetch({
    require: false
  });
  // not event existed insert first event
  if (lastEvent === null) {
    await updateNodeCurrentStatus(node.id, status);
    await insertNewEvent(node.id, method, status, rawData);

    return;
  }

  // same status, do nothing
  if (nodeCurrentStatus == status) {
    return;
  }

  // update event that has not been closed
  if (lastEvent.end_time == null) {
    updateEventEndTime(lastEvent, method);
  }
  await updateNodeCurrentStatus(node.id, status);
  await insertNewEvent(node.id, method, status, rawData);
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
    node = await new Node({
      mac_address: macAddress
    }).fetch({
      require: false
    });

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

    console.log(`[${moment()}] [PUSH] Node "${node.toJSON().name}" (id: ${node.id}), status: ${status}`);
    await processNodeStatus(node, 'PUSH', status, rawData);

    res.sendStatus(200);
  })
});

/***************************/
/* periodical ping to WISE */
/***************************/
schedule.scheduleJob('0,10,20,30,40,50 * * * * *', async () => {
  let nodes = (await new Node().fetchAll()).toJSON();
  let options = {
    headers: {
      'Authorization': 'Basic ' + Buffer.from(NODE_USERNAME + ':' + NODE_PASSWORD).toString('base64')
    }
  };
  await asyncForEach(nodes, async function(jsonNode) {
    let url = 'http://' + jsonNode.ip_address + '/di_value/slot_0';

    let response = await axios.get(url, options);
    let rawData = response.data['DIVal'].map((item) => item['Val']).join('');
    let status = statusMapper(rawData);

    let node = await new Node({id: jsonNode.id}).fetch();
    console.log(`[${moment()}] [PULL] Node "${node.toJSON().name}" (id: ${node.id}), status: ${status}`);
    processNodeStatus(node, 'PULL', status, rawData);
  });
});


const CATCHER_PORT_NUMBER = process.env.CATCHER_PORT_NUMBER || 8000
// TODO: perdiodical ping
app.listen(CATCHER_PORT_NUMBER, function() {
  console.log(`Event Catcher Server started at Port ${CATCHER_PORT_NUMBER}`)
})
