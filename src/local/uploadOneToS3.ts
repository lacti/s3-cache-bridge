import { existsSync } from "fs";
import s3Upload from "../s3/upload";
import log from "../utils/log";
import keyAsLocalFile from "./keyAsLocalFile";

export default async function uploadOneToS3(key: string) {
  const localFile = keyAsLocalFile(key);
  if (!existsSync(localFile)) {
    return;
  }
  log(`Upload to S3`, localFile, key);
  return s3Upload(key, localFile);
}
