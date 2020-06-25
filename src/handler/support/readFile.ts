import { ReadStream, createReadStream, existsSync, lstatSync } from "fs";

import Response from "../response";
import ensureParentDirectory from "../../utils/ensureParentDirectory";
import keyAsLocalFile from "../../local/keyAsLocalFile";
import log from "../../utils/log";
import s3Download from "../../s3/download";

export default async function readFile({
  key,
}: {
  key: string;
}): Promise<Response<ReadStream>> {
  // Download a file from S3 if a local cache doesn't exist.
  const localFile = keyAsLocalFile(key);
  await ensureLocalFile(key, localFile);

  // An empty file cannot create a ReadStream.
  const stat = lstatSync(localFile);
  if (stat.size === 0) {
    throw new Error(`Empty file [${key}]`);
  }

  log("Get local file", localFile);
  return {
    length: lstatSync(localFile).size,
    value: createReadStream(localFile),
  };
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
