import RouteEvent from "../routeEvent";
import acquireLock from "../../local/lock/acquireLock";
import keyAsLocalFile from "../../local/keyAsLocalFile";
import log from "../../utils/log";
import releaseLock from "../../local/lock/releaseLock";
import syncOneWithS3 from "../../local/syncOneWithS3";

export default async function updateFileState({ key, query }: RouteEvent) {
  const localFile = keyAsLocalFile(key);
  log("Update a local file state", key, localFile, query);

  if (query.sync === "1") {
    log("Sync immediately", key);
    await syncOneWithS3(key);
  } else if (query.lock === "acquire") {
    log("Acquire lock", key);
    await acquireLock(key);
  } else if (query.lock === "release") {
    log("Release lock", key);
    releaseLock(key);
  }
}
