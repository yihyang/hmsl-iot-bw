const services = require('./services');

services.svc.install();
services.svc2.install();
services.oeeGenerator.install();
// services.svc4.install();
services.oeeReworkQueue.install()
services.refreshHDHDatabaseView.install();

