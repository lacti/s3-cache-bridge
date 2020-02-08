import { existsSync, unlinkSync } from "fs";
import log from "../../utils/log";
import keyAsLockFile from "./keyAsLockFile";

export default function releaseLock(key: string) {
  const lockFile = keyAsLockFile(key);
  if (!existsSync(lockFile)) {
    throw new Error("Invalid lock state");
  }
  unlinkSync(lockFile);
  log("Release a lock", lockFile);
}
