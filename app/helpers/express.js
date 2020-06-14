function timeLogger(req, res, next) {
  let label = `${req.method} ${req.originalUrl}`;
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
