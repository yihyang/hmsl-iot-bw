
require('dotenv').config()

/*
 * Check is AM premise
 */
function isAM() {
  return process.env.PREMISE_NAME == 'AM';
}

/*
 * Check is AM premise
 */
function isBW() {
  return process.env.PREMISE_NAME == 'BW';
}

module.exports = {
  isAM,
  isBW,
}
