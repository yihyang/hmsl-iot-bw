
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

/**
 * Get full name of the site
 *
 * @return     string
 */
function getSiteFullName() {
  return process.env.SITE_NAME + ' ' + process.env.PREMISE_NAME
}

function getSiteName() {
  return process.env.PREMISE_NAME
}

module.exports = {
  isAM,
  isBW,
  getSiteFullName,
  getSiteName,
}
