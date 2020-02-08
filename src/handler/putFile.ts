import { createWriteStream } from "fs";
import { Readable } from "stream";
import dirty from "../local/dirty";
import keyAsLocalFile from "../local/keyAsLocalFile";
import ensureParentDirectory from "../utils/ensureParentDirectory";
import log from "../utils/log";

export default async function putFile(key: string, readable: Readable) {
  const localFile = keyAsLocalFile(key);
  log(`Upload local file`, key, localFile);

  dirty.add(key);
  ensureParentDirectory(localFile);
  return new Promise<void>((resolve, reject) =>
    readable
      .on("error", reject)
      .pipe(createWriteStream(localFile))
      .on("error", reject)
      .on("finish", resolve)
  );
}
