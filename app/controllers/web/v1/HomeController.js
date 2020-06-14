const rootPath = './../../..'

let index = async function(req, res) {
  res.render('web/v1/home/index')
}

module.exports = {
  index
}
