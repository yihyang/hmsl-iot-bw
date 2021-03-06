const rootPath = './../../../../../..'

let SolderPaste = require(rootPath + '/app/models/ProductionSystem/SolderPaste')

let index = (req, res) => {
  res.render('web/v1/production-systems/solder-pastes/bag-scanning/index')
}

// verify qr code

let verifyFormData = async (req, res) => {
  let { material_number, batch, bag_number } = req.body
  console.log(material_number, batch, bag_number)
  let previousSolderPaste = await getPreviousSolderPaste(material_number, batch, bag_number)

  if (previousSolderPaste) {
    previousSolderPaste = previousSolderPaste.toJSON()
  }

  res.json(
    {
      data: {
        previous_solder_paste: previousSolderPaste
      }
    }
  )
}

let save = async (req, res) => {
  let { po_number, material_number, batch, bag_number, weight } = req.body
  let userId = req.user.id

  let previousSolderPaste = await getPreviousSolderPaste(material_number, batch, bag_number)

  if (previousSolderPaste) {
    // new balance
    let newWeight = previousSolderPaste.attributes.weight - weight
    await new SolderPaste({id: previousSolderPaste.id}).save({weight: newWeight}, {patch: true})
  }

  let solderPaste = await new SolderPaste({po_number, material_number, batch, bag_number, weight, creator_id: req.user.id}).save()

  req.flash('success', `Added new Solder Paste Record`)
  res.redirect('/ps/solder-pastes/bag-scanning')
}

let getPreviousSolderPaste = async (materialNumber, batch, bagNumber) => {
  return await new SolderPaste().query(qb => {
    qb.where('material_number', materialNumber)
      .where('batch', batch)
      .where('bag_number', bagNumber)
      .orderBy('id', 'DESC')
  }).fetch({require: false})
}


module.exports = {
  index,
  verifyFormData,
  save
}
