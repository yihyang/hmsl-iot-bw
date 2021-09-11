var Service = require('node-windows').Service;

// service
var svc = new Service({
  name:'HMSL IOT Service',
  description: 'HMSL IOT Service',
  script: 'C:\\hmsl-iot\\repo\\hmsl-iot\\app.js'
});

svc.on('install',function(){
  svc.start();
  console.log('installed HTML IOT Service');
});

svc.on('uninstall',function(){
  console.log('Uninstall HTML IOT Service complete.');
  console.log('The service exists: ', svc.exists);
});


// event catcher
var svc2 = new Service({
  name:'HMSL IOT Event Catcher',
  description: 'HMSL IOT Event Catcher',
  script: 'C:\\hmsl-iot\\repo\\hmsl-iot\\event_catcher.js'
});

svc2.on('install',function(){
  svc2.start();
  console.log('installed HTML IOT Event Catcher');
});

svc2.on('uninstall',function(){
  console.log('Uninstall HTML IOT Event Catcher complete.');
  console.log('The service exists: ',svc2.exists);
});


// oee generator
var oeeGenerator = new Service({
  name:'HMSL OEE Generator',
  description: 'HMSL OEE Generator',
  script: 'C:\\hmsl-iot\\repo\\hmsl-iot\\oee_generator.js'
});

oeeGenerator.on('install',function(){
  oeeGenerator.start();
  console.log('installed HTML OEE Generator');
});

oeeGenerator.on('uninstall',function(){
  console.log('Uninstall HTML OEE Generator complete.');
  console.log('The service exists: ',oeeGenerator.exists);
});

// oee rework
// var svc4 = new Service({
//   name:'HMSL OEE Rework',
//   description: 'HMSL OEE Rework',
//   script: 'C:\\hmsl-iot\\repo\\hmsl-iot\\oee_rework.js'
// });

// svc4.on('install',function(){
//   svc4.start();
//   console.log('installed HTML OEE Rework');
// });

// svc4.on('uninstall',function(){
//   console.log('Uninstall HTML OEE Rework complete.');
//   console.log('The service exists: ',svc4.exists);
// });

// oee rework queue
var oeeReworkQueue = new Service({
  name:'HMSL OEE Rework Queue',
  description: 'HMSL OEE Queue',
  script: 'C:\\hmsl-iot\\repo\\hmsl-iot\\queues.js'
});

oeeReworkQueue.on('install',function(){
  oeeReworkQueue.start();
  console.log('installed HTML OEE Queue');
});

oeeReworkQueue.on('uninstall',function(){
  console.log('Uninstall HTML OEE Queue complete.');
  console.log('The service exists: ',oeeReworkQueue.exists);
});

module.exports = {
  svc,
  svc2,
  oeeGenerator,
  // svc4,
  oeeReworkQueue,
}
