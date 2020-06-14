function respondSuccessWithData(title, detail, data, status = '200') {
  return {
    "success": [{
      status,
      title,
      detail
    }],
    data
  }
}

function respondSuccess(title, detail, status = '200') {
  return {
    "success": [{
      status,
      title,
      detail
    }]
  }
}

function respondError(title, detail, status = '404') {
  return {
    "error": [{
      status,
      title,
      detail
    }]
  }
}

module.exports = {
  respondSuccess,
  respondSuccessWithData,
  respondError
}
