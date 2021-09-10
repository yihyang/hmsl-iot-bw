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
    concurrency: 2,
    // Install signal handlers for graceful shutdown on SIGINT, SIGTERM, etc
    noHandleSignals: false,
    pollInterval: 1000,
      taskDirectory: `${__dirname}/app/tasks`,
  });

  return {workerUtils, runner};

}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
