function getDefaultMaxValue(siteName) {
  return 11
  // return siteName === "AM" ? 11 : 9
}

function getDefaultButtonValue(siteName) {
  return siteName === "AM" ? 11 : 9
}

module.exports = {
  getDefaultMaxValue,
  getDefaultButtonValue,
}
