import { existsSync, lstatSync, readdirSync, unlinkSync } from "fs";
import { join } from "path";
import log from "../../utils/log";
import lockDir from "./lockDir";

const maxLockTimeoutMillis = 60 * 1000;

export default function cleanupExpiredLockFiles() {
  if (!existsSync(lockDir)) {
    return;
  }
  const lockFileNames = readdirSync(lockDir);
  if (lockFileNames.length === 0) {
    return;
  }

  log("Try to cleanup expired lock files", lockFileNames);
  for (const lockFileName of lockFileNames) {
    const lockFile = join(lockDir, lockFileName);
    const stat = lstatSync(lockFile);
    const lockAliveMillis = Date.now() - stat.ctime.getTime();
    if (lockAliveMillis > maxLockTimeoutMillis) {
      log("Delete expired lock forcefully", lockFile, lockAliveMillis);
      unlinkSync(lockFile);
    }
  }
}
