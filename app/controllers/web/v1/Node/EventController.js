const rootPath = './../../../../..'
const {
  filterParams,
  getPaginationAttributes,
} = require(`${rootPath}/app/helpers/route`)
const Event = require(`${rootPath}/app/models/Node/Event`)
const Node = require(`${rootPath}/app/models/Node/Node`)

let index = async function(req, res) {
  let paginationAttribute = getPaginationAttributes(req);
  let {id} = req.params;
  let node = (await new Node({id}).fetch({require: false})).toJSON();

  let events = (await new Event()
    .query(function(qb) {
      qb
        .where('node_id', id)
        .offset(paginationAttribute.page_offset)
        .limit(paginationAttribute.items_per_page)
    })
    .orderBy('id', 'DESC')
    .fetchAll()
  );

  let eventsCount = await new Event({node_id: id})
    .query(function(qb) {
      qb
        .where('node_id', id)
    })
    .count('*');
  let total_page = Math.ceil(parseInt(eventsCount) / paginationAttribute.items_per_page);

  events = events.toJSON();

  res.render('web/v1/nodes/events/index', {events, total_page, ...paginationAttribute, node})
}


module.exports = {
  index
}
