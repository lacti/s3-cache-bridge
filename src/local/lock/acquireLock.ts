import { existsSync, writeFileSync } from "fs";
import ensureParentDirectory from "../../utils/ensureParentDirectory";
import log from "../../utils/log";
import sleep from "../../utils/sleep";
import keyAsLockFile from "./keyAsLockFile";

const lockTimeout = 10 * 1000;
const lockPollingIntervalMillis = 50;

export default async function acquireLock(key: string) {
  const lockFile = keyAsLockFile(key);
  const start = Date.now();
  while (Date.now() - start <= lockTimeout) {
    if (!existsSync(lockFile) && writeLockFile(lockFile)) {
      log("Acquire a lock", lockFile);
      return;
    }
    await sleep(lockPollingIntervalMillis);
  }
  throw new Error(`Lock timeout [${key}]`);
}

function writeLockFile(lockFile: string) {
  try {
    ensureParentDirectory(lockFile);
    writeFileSync(lockFile, Date.now().toString(), { flag: "wx" });
    return true;
  } catch (error) {
    return false;
  }
}
