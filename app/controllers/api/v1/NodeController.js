const rootPath = './../../../..'
const Node = require(`${rootPath}/app/models/Node/Node`)
const {respondError, respondSuccessWithData} = require(`${rootPath}/app/helpers/response`)

let showByName = async function(req, res) {
  let {name} = req.params;
  let node = (await new Node({name}).fetch({require: false, withRelated: ['active_po_job.po_record']}));

  if (!node) {
    return res
      .status(404)
      .json(
        respondError("Not Found", "Unable to find machine with provided Name")
      )
  }

  node = node.toJSON();
  res.status(200)
    .json(
      respondSuccessWithData(
        "Object found",
        "Found PO with provided PO Number",
        node
      )
    )
}

module.exports = {
  showByName,
}
