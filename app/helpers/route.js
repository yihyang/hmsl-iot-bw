const {ITEMS_PER_PAGE} = require('./../../config/settings');
let {
  pickBy,
} = require('lodash');

let filterParams = function(params, allowedOptions) {
  return pickBy(params, function(v, k) {
    return (allowedOptions.indexOf(k) != -1);
  });
}

let getPaginationAttributes = function(req) {
  var current_path = req.path;
  var current_page = parseInt(req.query.page || 1);
  let page_offset = ((current_page - 1) * ITEMS_PER_PAGE);

  return {
    current_path, current_page, page_offset, items_per_page: ITEMS_PER_PAGE
  };
}

module.exports = {
  filterParams,
  getPaginationAttributes,
};
