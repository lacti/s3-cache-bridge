import log from "../../utils/log";
import { RunningHandle } from "../../utils/runningHandle";
import cleanupExpiredLockFiles from "./cleanupExpiredLockFiles";

const lockCheckIntervalMillis = 10 * 1000;

export default async function cleanupExpiredLockPeriodically(
  handle: RunningHandle
) {
  log("Start to watch expired lock files");
  while (handle.value()) {
    cleanupExpiredLockFiles();
    await handle.sleep(lockCheckIntervalMillis);
  }
  log("End of expired lock watcher");
}
