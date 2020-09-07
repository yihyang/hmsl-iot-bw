const rootPath = './../../..'
// const Area = require(`${rootPath}/models/Node/Area/Area`)
const Node = require(`${rootPath}/models/Node/Node`)
const Event = require(`${rootPath}/models/Node/Event`)
const events = require('./Node/EventController')

let index = async function(req, res) {
  let nodes = (await new Node().fetchAll({withRelated: ['active_po_job.po_record']})).toJSON();
  let socketIoHost = process.env.SOCKET_IO_HOST;
  res.render('web/v1/nodes/index', { nodes, socketIoHost })
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
