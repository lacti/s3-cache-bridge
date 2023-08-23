import cleanupExpiredLockPeriodically from "./local/lock/cleanupExpiredLockPeriodically";
import http from "http";
import log from "./utils/log";
import { port } from "./env";
import route from "./handler/route";
import runningHandle from "./utils/runningHandle";
import { serve } from "micro";
import syncWithS3Periodically from "./local/syncWithS3Periodically";

// Start web server.
const server = new http.Server(serve(route));
server.listen(port);
log("Server is ready on", port);

// Start S3 synchronization loop.
const handle = runningHandle(true);
const syncPromise = syncWithS3Periodically(handle).catch(log);

// Start expired lock cleaner.
cleanupExpiredLockPeriodically(handle).catch(log);

// Setup stop signal handlers.
async function finalize() {
  if (!handle.value()) {
    return;
  }
  log("Catch stop signal");
  handle.update(false);

  try {
    await syncPromise;
    log("End");
  } finally {
    process.exit(0);
  }
}

process.on("SIGINT", finalize);
process.on("SIGTERM", finalize);
