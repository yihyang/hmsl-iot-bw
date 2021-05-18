function getDefaultMaxValue(siteName) {
  return siteName === "AM" ? 11 : 9
}

module.exports = {
  getDefaultMaxValue
}
