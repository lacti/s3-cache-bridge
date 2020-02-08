import { existsSync, rmdirSync } from "fs";
import { cacheDir } from "../env";
import log from "../utils/log";

export default function cleanupAllLocalCacheFiles() {
  if (!existsSync(cacheDir)) {
    return;
  }
  log("Delete all local caches");
  rmdirSync(cacheDir, { recursive: true });
}
