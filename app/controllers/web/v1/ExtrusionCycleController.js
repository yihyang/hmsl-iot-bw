const rootPath = './../../../..'
const ExtrusionCycle = require(`${rootPath}/app/models/ExtrusionCycle/ExtrusionCycle`)

let index = async (req, res) => {
  let extrusionCycles = (await new ExtrusionCycle().query(function(qb) {
    qb.orderBy('category', 'asc')
      .orderBy('alloy', 'asc')
      .orderBy('billet_size', 'asc')
      .orderBy('diameter', 'asc')
  }).fetchAll()).toJSON();

  res.render('web/v1/extrusion-cycles/index', {extrusionCycles})
}

let update = async (req, res) => {
  let result = {};

  let { id, key, value } = req.body;

  let cycle = await new ExtrusionCycle({id}).fetch({require: false});

  if (!cycle) {
    return res.json({'message': `Cycle with ID ${id} not found`})
  }

  let data = cycle.toJSON().data || {};
  data[key] = value

  await cycle.save({data}, {patch: true})

  res.json({'message': `Updated Cycle with ID ${cycle.id} to "${value}"`})
}

module.exports = {
  index,
  update
}
