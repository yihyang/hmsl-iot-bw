const { connectionString } = require('./queue_add_job')

const { run, quickAddJob, makeWorkerUtils } = require("graphile-worker");

async function main() {
  const workerUtils = await makeWorkerUtils({
    connectionString,
  });
  try {
    await workerUtils.migrate();
  } catch (e) {

  }
  const runner = await run({
    connectionString,
    concurrency: 5,
    // Install signal handlers for graceful shutdown on SIGINT, SIGTERM, etc
    noHandleSignals: false,
    pollInterval: 1000,
      taskDirectory: `${__dirname}/app/tasks`,
  });

  return {workerUtils, runner};

}

let {runner} = main();
