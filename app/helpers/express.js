const moment = require('moment')

function timeLogger(req, res, next) {
  let time = moment()
  let label = `${time} - ${req.method} ${req.originalUrl} ${JSON.stringify(req.body)}`
  console.time(label);

  function afterResponse() {
    res.removeListener('finish', afterResponse);
    res.removeListener('close', afterResponse);

    // action after response
    console.timeEnd(label);
  }

  res.on('finish', afterResponse);
  res.on('close', afterResponse);

  next();
}

module.exports = {
  timeLogger
}
