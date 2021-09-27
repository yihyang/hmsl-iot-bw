const rootPath = './../../../../../..'

const Node = require(`${rootPath}/app/models/Node/Node`);
const NodeDefaultValue = require(`${rootPath}/app/models/OEE/NodeDefaultValue`);

const DEFAULT_AVAILABILITY = 12

let index = async (req, res) => {
  res.render('web/v1/oee/settings/node-default-values/index')
}

let area = async (req, res) => {
  let { area } = req.params

  let nodeDefaultValues = await new NodeDefaultValue()
    .fetchAll();
  NodeDefaultValues = nodeDefaultValues.toJSON()

  let nodeValues = nodeDefaultValues.reduce((acc, value) => {
    acc[value.node_id] = value;
    return acc;
  }, {});

  let nodes = await new Node()
    .query((qb) => {
      qb.orderBy('position_x', 'asc')
        .orderBy('position_y', 'asc')
    })
    .fetchAll();
  nodes = nodes.toJSON();

  // merge default capacity and availability to node
  nodes.map((node) => {
    node['am_availability'] = nodeValues[node.id] ? nodeValues[node.id].am_availability : DEFAULT_AVAILABILITY;
    node['pm_availability'] = nodeValues[node.id] ? nodeValues[node.id].pm_availability : DEFAULT_AVAILABILITY;
    // node['am_capacity'] = nodeValues[node.id] ? nodeValues[node.id].am_capacity : DEFAULT_CAPACITY;
    // node['pm_capacity'] = nodeValues[node.id] ? nodeValues[node.id].pm_capacity : DEFAULT_CAPACITY;

    return node;
  });

  res.render('web/v1/oee/settings/node-default-values/area', {nodes, area})
}

let update = async function(req, res) {
  let node_id = req.params.nodeId;
  let {type, value} = req.body;

  let valueLabel = type;
  let defaultValue = await new NodeDefaultValue({node_id}).fetch({require: false});
  let updateValues = {}
  updateValues[valueLabel] = value;

  if (defaultValue) {
    await defaultValue.save(updateValues, {patch: true});
  } else {
    updateValues.node_id = node_id;
    await new NodeDefaultValue(updateValues).save();
  }

  let node = await new Node({id: node_id}).fetch();
  node = node.toJSON();

  res.json({'message': 'Successfully updated ' + type + ' for Machine ' + node.name + ' to ' + value});
};

module.exports = {
  index,
  area,
  update
}
