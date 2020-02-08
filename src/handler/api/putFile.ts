import { createWriteStream } from "fs";
import { Readable } from "stream";
import dirty from "../../local/dirty";
import keyAsLocalFile from "../../local/keyAsLocalFile";
import syncOneWithS3 from "../../local/syncOneWithS3";
import ensureParentDirectory from "../../utils/ensureParentDirectory";
import log from "../../utils/log";
import IRouteEvent from "../routeEvent";

export default async function putFile({
  key,
  req: readable,
  query
}: IRouteEvent) {
  const localFile = keyAsLocalFile(key);
  log("Put a local file", key, localFile, query);

  dirty.add(key);
  await writeToLocalFile(readable, localFile, query.append === "1");

  if (query.sync === "1") {
    log("Sync immediately", key);
    await syncOneWithS3(key);
  }
}

function writeToLocalFile(
  readable: Readable,
  localFile: string,
  append: boolean
) {
  ensureParentDirectory(localFile);
  return new Promise<void>((resolve, reject) =>
    readable
      .on("error", reject)
      .pipe(
        createWriteStream(localFile, {
          flags: append ? "a" : "w"
        })
      )
      .on("error", reject)
      .on("finish", resolve)
  );
}
