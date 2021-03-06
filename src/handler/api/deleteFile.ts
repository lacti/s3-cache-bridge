import { existsSync, unlinkSync } from "fs";

import RouteEvent from "../routeEvent";
import dirty from "../../local/dirty";
import keyAsLocalFile from "../../local/keyAsLocalFile";
import lockGuard from "../../local/lock/lockGuard";
import log from "../../utils/log";
import s3Delete from "../../s3/delete";
import syncOneWithS3 from "../../local/syncOneWithS3";

export default async function deleteFile({ key, query }: RouteEvent) {
  async function deleteWork() {
    // Delete only cache.
    if (query.cache === "1") {
      log("Delete only cache", key);
      return invalidateCache(key);
    }

    // Remove a dirty marker.
    dirty.delete(key);

    // Invalid a local cache.
    await invalidateCache(key);

    // And then, delete a file from S3.
    const deleted = await s3Delete(key);
    log("Delete file from S3", key, deleted);
  }
  return query.noLock === "1" ? deleteWork() : lockGuard(key, deleteWork);
}

async function invalidateCache(key: string) {
  // If it is dirty, sync it with S3.
  if (dirty.has(key)) {
    await syncOneWithS3(key);
  }

  // And then delete a local cache.
  const localFile = keyAsLocalFile(key);
  if (existsSync(localFile)) {
    log("Delete local file", localFile);
    unlinkSync(localFile);
  }
}
