const reasons = require('./Setting/ReasonController')
const spareParts = require('./Setting/SparePartController')

let index = function(req, res) {
  res.render('web/v1/gwo/settings/index')
}

module.exports = {
  reasons,
  spareParts,
  index
}
