import log from "../utils/log";
import dirty from "./dirty";
import uploadOneToS3 from "./uploadOneToS3";

export default async function syncOneWithS3(key: string) {
  try {
    log("Sync one key", key);
    await uploadOneToS3(key);
    dirty.delete(key);
  } catch (error) {
    log("Cannot sync key", key);
  }
}
