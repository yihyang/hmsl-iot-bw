var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'HMSL IOT Service',
  description: 'HMSL IOT Service',
  script: 'C:\\hmsl-iot\\repo\\hmsl-iot\\app.js'
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
  console.log('installed HTML IOT Service');
});

svc.install();

var svc2 = new Service({
  name:'HMSL IOT Event Catcher',
  description: 'HMSL IOT Event Catcher',
  script: 'C:\\hmsl-iot\\repo\\hmsl-iot\\event_catcher.js'
});

svc2.on('install',function(){
  svc2.start();
  console.log('installed HTML IOT Event Catcher');
});

svc2.install();

var svc3 = new Service({
  name:'HMSL OEE Generator',
  description: 'HMSL OEE Generator',
  script: 'C:\\hmsl-iot\\repo\\hmsl-iot\\oee_generator.js'
});

svc3.on('install',function(){
  svc3.start();
  console.log('installed HTML OEE Generator');
});

svc3.install();
