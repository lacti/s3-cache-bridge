import { cacheDir, syncMillis } from "../env";

import { RunningHandle } from "../utils/runningHandle";
import cleanupAllLocalCacheFiles from "./cleanupAllLocalCacheFiles";
import cleanupLocalCacheFiles from "./cleanupLocalCacheFiles";
import dirty from "./dirty";
import { existsSync } from "fs";
import log from "../utils/log";
import pLimit from "p-limit";
import syncOneWithS3 from "./syncOneWithS3";

const limit = pLimit(8);

export default async function syncWithS3Periodically(handle: RunningHandle) {
  log("Start sync");

  // Synchronization loop.
  while (handle.value()) {
    await doSyncAll();
    cleanupLocalCacheFiles();

    await handle.sleep(syncMillis);
  }

  // Final synchronization.
  await doSyncAll();
  cleanupAllLocalCacheFiles();

  log("Stop sync");
}

async function doSyncAll() {
  if (!existsSync(cacheDir)) {
    return;
  }

  log("Do sync");
  const promises: Array<Promise<void>> = [];
  for (const key of dirty) {
    promises.push(limit(() => syncOneWithS3(key)));
  }
  await Promise.all(promises);
}
