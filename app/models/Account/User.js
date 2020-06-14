const rootPath = '../../..'
const bcrypt = require('bcryptjs')
const security = require(`${rootPath}/config/security`)
const bookshelf = require(`${rootPath}/config/bookshelf`)

var User = bookshelf.Model.extend({
  hasTimestamps: true,
  tableName: 'users',
  validPassword(password) {
    return bcrypt.compareSync(password, this.attributes.password);
  },
  initialize() {
    this.on('saving', async (model) => {
      if (!model.hasChanged('password')) return;

      const salt = await bcrypt.genSalt(security.saltRounds);
      const hashedPassword = bcrypt.hashSync(model.attributes.password, salt);
      model.set('password', hashedPassword);
    });
  },
  async createNewAccessToken() {
    const TOKEN_LENGTH = 64;
    var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var accessToken = '';
    for (var i = 0; i < TOKEN_LENGTH; i++) {
      accessToken += chars[Math.floor(Math.random() * chars.length)];
    }

    await this.save({
      access_token: accessToken
    }, {
      method: 'update',
      patch: true
    });

    return accessToken;
  }
}, {
  async authenticate(username, password) {
    let user = await new User({
      username
    }).fetch({
      require: false
    });

    if (!user) {
      return false;
    }

    if (!user.validPassword(password)) {
      return false;
    }

    await user.createNewAccessToken();

    return await new User({
      id: user.id
    }).fetch({
      columns: ['id', 'username', 'employee_id', 'name']
    })
  },
  async authenticateWithEmployeeId(employeeId) {
    let user = await new User({
      employee_id: employeeId
    }).fetch({
      require: false
    });

    if (!user) {
      return false;
    }

    await user.createNewAccessToken();

    return await new User({
      id: user.id
    }).fetch({
      columns: ['id', 'username', 'employee_id', 'name']
    })
  }
});


module.exports = User;
