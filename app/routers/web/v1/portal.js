const web = require('./../../../controllers/web')


module.exports = (app) => {
    app.get('/', web.v1.nodes.index)
}
