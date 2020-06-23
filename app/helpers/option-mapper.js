let mapOptionsForSelect2 = function(items, idKey, titleKey) {
  return items.reduce((cumulator, currentValue) => {
    cumulator[currentValue[idKey]] = currentValue[titleKey];
    return cumulator;
  }, {});
}

module.exports = {
  mapOptionsForSelect2
}
