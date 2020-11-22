const rootPath = './../../..'
const _ = require('lodash')
// const Area = require(`${rootPath}/models/Node/Area/Area`)
const Node = require(`${rootPath}/models/Node/Node`)
const NodeGroup = require(`${rootPath}/models/Node/NodeGroup`)
const Event = require(`${rootPath}/models/Node/Event`)
const events = require('./Node/EventController')

let index = async function(req, res) {
  let nodes = (await new Node().fetchAll({withRelated: ['active_po_job.po_record', 'node_group']})).toJSON();
  let socketIoHost = process.env.SOCKET_IO_HOST;

  // start grouping nodes with order
  let groupedNodes = _.reduce(
    nodes,
    function(result, node) {
      let groupName = 'Ungrouped'
      if (node.node_group_id) {
        groupName = node.node_group.name
      }

      let group = result[groupName] || []
      group.push(node)

      result[groupName] = group

      return result
    },
    {}
  )

  let nodeGroups = (await new NodeGroup().fetchAll()).toJSON();

  nodeGroups = _.map(nodeGroups, function(group) {
    let nodes = groupedNodes[group.name]

    if (nodes) {
      delete(groupedNodes[group.name])
    } else {
      nodes = []
    }

    return {
      position: group.position,
      name: group.position,
      nodes: nodes
    };
  })

  // include the balance that are not in the group
  _.each(groupedNodes, function(value, key) {
    nodeGroups.push({
      position: 999,
      name: key,
      nodes: value,
    })
  })

  nodeGroups = _.sortBy(nodeGroups, (group) => { group.position })

  console.log(nodeGroups)

  res.render('web/v1/nodes/index', { nodeGroups, socketIoHost })
}

let show = async function(req, res) {
  let {id} = req.params;
  let node = (await new Node({id}).fetch({require: false, withRelated: ['active_po_job.po_record']})).toJSON();
  let recentEvents = (
    await new Event()
      .query(function (qb) {
        qb
          .where('node_id', id)
          .orderBy('id', 'DESC')
          .limit(10)
      })
      .fetchAll()
    ).toJSON();
  // let socketIoHost = process.env.SOCKET_IO_HOST;
  res.render('web/v1/nodes/show', { node, recentEvents })
}

module.exports = {
  index,
  show,
  events
}
