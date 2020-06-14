require('dotenv').config();

module.exports = {
  jwtSecret: process.env.APP_SECRET,
  saltRoute: process.env.SALT_ROUND
}
