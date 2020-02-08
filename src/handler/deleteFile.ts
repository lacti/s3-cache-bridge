import s3Delete from "../s3/delete";
import log from "../utils/log";
import invalidateCache from "./invalidateCache";

export default async function deleteFile(key: string) {
  invalidateCache(key);
  const deleted = await s3Delete(key);
  log(`Delete file from S3`, key, deleted);
}
