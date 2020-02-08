import { createReadStream, existsSync, lstatSync, unlinkSync } from "fs";
import keyAsLocalFile from "../../local/keyAsLocalFile";
import s3Download from "../../s3/download";
import ensureParentDirectory from "../../utils/ensureParentDirectory";
import log from "../../utils/log";
import IRouteEvent from "../routeEvent";

export default async function getFile({ key }: IRouteEvent) {
  // Download a file from S3 if a local cache doesn't exist.
  const localFile = keyAsLocalFile(key);
  await ensureLocalFile(key, localFile);

  // An empty file cannot create a ReadStream.
  const stat = lstatSync(localFile);
  if (stat.size === 0) {
    throw new Error("Empty file");
  }

  log("Get local file", localFile);
  return createReadStream(localFile);
}

async function ensureLocalFile(key: string, localFile: string) {
  if (existsSync(localFile)) {
    return;
  }

  log("Download file from S3", key);
  ensureParentDirectory(localFile);

  try {
    await s3Download(key, localFile);
  } catch (error) {
    // It can make a 0-size file even if it would be fail to download.
    if (existsSync(localFile)) {
      unlinkSync(localFile);
    }
    throw error;
  }
}
