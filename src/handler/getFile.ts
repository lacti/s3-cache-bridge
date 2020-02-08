import { createReadStream, existsSync, lstatSync, unlinkSync } from "fs";
import keyAsLocalFile from "../local/keyAsLocalFile";
import s3Download from "../s3/download";
import ensureParentDirectory from "../utils/ensureParentDirectory";
import log from "../utils/log";

export default async function getFile(key: string) {
  const localFile = keyAsLocalFile(key);
  if (!existsSync(localFile)) {
    log(`Download file from S3`, key);
    ensureParentDirectory(localFile);
    try {
      await s3Download(key, localFile);
    } catch (error) {
      if (existsSync(localFile)) {
        unlinkSync(localFile);
      }
      throw error;
    }
  }

  const stat = lstatSync(localFile);
  if (stat.size === 0) {
    throw new Error("Empty file");
  }

  log(`Get local file`, localFile);
  const readable = createReadStream(localFile);
  return readable;
}
