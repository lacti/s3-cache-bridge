import micro from "micro";
import { port } from "./env";
import route from "./handler/route";
import syncWithS3Periodically from "./local/syncWithS3Periodically";
import log from "./utils/log";
import runningHandle from "./utils/runningHandle";

// Start web server.
micro(route).listen(port);
log("Server is ready on", port);

// Start S3 synchronization loop.
const handle = runningHandle(true);
const syncPromise = syncWithS3Periodically(handle).catch(log);

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
