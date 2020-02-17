import { existsSync, lstatSync } from "fs";
import s3Upload from "../s3/upload";
import log from "../utils/log";
import keyAsLocalFile from "./keyAsLocalFile";
import tryToDeleteIfAbsent from "./tryToDeleteIfAbsent";

export default async function uploadOneToS3(key: string) {
  const localFile = keyAsLocalFile(key);
  if (!existsSync(localFile)) {
    return tryToDeleteIfAbsent(key, `it doesn't exist`);
  }
  const stat = lstatSync(localFile);
  if (stat.size === 0) {
    return tryToDeleteIfAbsent(key, `it is zero-length`);
  }
  log("Upload to S3", localFile, key);
  return s3Upload(key, localFile);
}
