import { existsSync } from "fs";
import pLimit from "p-limit";
import { cacheDir, syncMillis } from "../env";
import log from "../utils/log";
import { RunningHandle } from "../utils/runningHandle";
import cleanupLocalCacheFiles from "./cleanupLocalCacheFiles";
import dirty from "./dirty";
import syncOneWithS3 from "./syncOneWithS3";

const limit = pLimit(8);

export default async function syncWithS3Periodically(handle: RunningHandle) {
  log("Start sync");
  while (handle.value()) {
    if (existsSync(cacheDir)) {
      log("Do sync");
      const promises: Array<Promise<void>> = [];
      for (const key of dirty) {
        promises.push(limit(() => syncOneWithS3(key)));
      }
      await Promise.all(promises);
    }

    cleanupLocalCacheFiles();
    await handle.sleep(syncMillis);
  }
  log("Stop sync");
}
