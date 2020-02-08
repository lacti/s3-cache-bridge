import { existsSync, readdirSync } from "fs";
import { join } from "path";
import { cacheDir } from "../env";
import log from "../utils/log";
import unlinkOldLocalFiles from "./unlinkOldLocalFiles";

const remainingCount = 4096;

export default function cleanupLocalCacheFiles() {
  if (!existsSync(cacheDir)) {
    return;
  }

  const files = readdirSync(cacheDir);
  if (files.length <= remainingCount * 1.5) {
    return;
  }
  log("Cleanup old caches", files);
  unlinkOldLocalFiles(
    files.map(each => join(cacheDir, each)),
    remainingCount
  );
}
