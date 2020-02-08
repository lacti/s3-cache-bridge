import { existsSync, unlinkSync } from "fs";
import dirty from "../local/dirty";
import keyAsLocalFile from "../local/keyAsLocalFile";
import log from "../utils/log";

export default async function invalidateCache(key: string) {
  const localFile = keyAsLocalFile(key);
  dirty.delete(key);
  if (existsSync(localFile)) {
    log(`Delete local file`, localFile);
    unlinkSync(localFile);
  }
}
