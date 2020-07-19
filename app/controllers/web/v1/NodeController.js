const rootPath = './../../..'
// const Area = require(`${rootPath}/models/Node/Area/Area`)
const Node = require(`${rootPath}/models/Node/Node`)
const Event = require(`${rootPath}/models/Node/Event`)

let index = async function(req, res) {
  let nodes = (await new Node().fetchAll()).toJSON();
  let socketIoHost = process.env.SOCKET_IO_HOST;
  res.render('web/v1/nodes/index', { nodes, socketIoHost })
}

let show = async function(req, res) {
  let {id} = req.params;
  let node = (await new Node({id}).fetch({require: false})).toJSON();
  let recentEvents = (
    await new Event({node_id: id})
      .query(function (qb) {
        qb.orderBy('id', 'DESC')
          .limit(10)
      })
      .fetchAll()
    ).toJSON();
  // let socketIoHost = process.env.SOCKET_IO_HOST;
  res.render('web/v1/nodes/show', { node, recentEvents })
}

module.exports = {
  index,
  show
}
