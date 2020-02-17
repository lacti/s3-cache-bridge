import { createReadStream, existsSync, lstatSync } from "fs";
import keyAsLocalFile from "../../local/keyAsLocalFile";
import lockGuard from "../../local/lock/lockGuard";
import s3Download from "../../s3/download";
import ensureParentDirectory from "../../utils/ensureParentDirectory";
import log from "../../utils/log";
import IRouteEvent from "../routeEvent";

export default async function getFile({ key, query }: IRouteEvent) {
  async function getWork() {
    // Download a file from S3 if a local cache doesn't exist.
    const localFile = keyAsLocalFile(key);
    await ensureLocalFile(key, localFile);

    // An empty file cannot create a ReadStream.
    const stat = lstatSync(localFile);
    if (stat.size === 0) {
      throw new Error(`Empty file [${key}]`);
    }

    log("Get local file", localFile);
    return createReadStream(localFile);
  }
  return query.noLock === "1" ? getWork() : lockGuard(key, getWork);
}

async function ensureLocalFile(key: string, localFile: string) {
  if (existsSync(localFile)) {
    return;
  }

  log("Download file from S3", key);
  ensureParentDirectory(localFile);

  // It makes an empty file if there is no object in S3.
  // It will help to reduce access count when there are many requests for absent objects.
  await s3Download(key, localFile);
}
