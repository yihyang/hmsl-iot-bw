const rootPath = './../../..'
// const Area = require(`${rootPath}/models/Node/Area/Area`)
const Node = require(`${rootPath}/models/Node/Node`)

let index = async function(req, res) {
  let nodes = (await new Node().fetchAll()).toJSON();
  let socketIoHost = process.env.SOCKET_IO_HOST;
  res.render('web/v1/nodes/index', { nodes, socketIoHost })
}

module.exports = {
  index
}
