var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'HMSL IOT Service',
  description: 'HMSL IOT Service',
  script: 'C:\\hmsl-iot\\repo\\hmsl-iot\\app.js'
});

// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall',function(){
  console.log('Uninstall complete.');
  console.log('The service exists: ',svc.exists);
});

// Uninstall the service.
svc.uninstall();

var svc2 = new Service({
  name:'HMSL IOT Event Catcher',
  description: 'HMSL IOT Event Catcher',
  script: 'C:\\hmsl-iot\\repo\\hmsl-iot\\event_catcher.js'
});

// Listen for the "uninstall" event so we know when it's done.
svc2.on('uninstall',function(){
  console.log('Uninstall complete.');
  console.log('The service exists: ',svc2.exists);
});

// Uninstall the service.
svc2.uninstall();


var svc3 = new Service({
  name:'HMSL OEE Generator',
  description: 'HMSL OEE Generator',
  script: 'C:\\hmsl-iot\\repo\\hmsl-iot\\oee_generator.js'
});

// Listen for the "uninstall" event so we know when it's done.
svc3.on('uninstall',function(){
  console.log('Uninstall complete.');
  console.log('The service exists: ',svc3.exists);
});

// Uninstall the service.
svc3.uninstall();
