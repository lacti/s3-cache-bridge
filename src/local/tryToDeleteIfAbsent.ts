import s3Delete from "../s3/delete";
import log from "../utils/log";
import keyAsLocalFile from "./keyAsLocalFile";

export default async function tryToDeleteIfAbsent(key: string, reason: string) {
  log(`Try to delete from S3 because ${reason}`, key, keyAsLocalFile(key));
  try {
    await s3Delete(key);
  } catch (error) {
    log(`Failed to delete S3`, key, error.message);
  }
}
