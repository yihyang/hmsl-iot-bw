const rootPath = '../../../..'
let inputMaterials = require('./Operator/InputMaterialController')
let poCheckout = require('./Operator/PoCheckoutController')
let poInputs = require('./Operator/PoInputController')
let poEnd = require('./Operator/PoEndController')

let index = async function(req, res) {
  res.render('web/v1/operators/index')
}

module.exports = {
  index,
  inputMaterials,
  poInputs,
  poCheckout,
  poEnd,
}
