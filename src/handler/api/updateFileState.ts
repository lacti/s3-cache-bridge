import keyAsLocalFile from "../../local/keyAsLocalFile";
import acquireLock from "../../local/lock/acquireLock";
import releaseLock from "../../local/lock/releaseLock";
import syncOneWithS3 from "../../local/syncOneWithS3";
import log from "../../utils/log";
import IRouteEvent from "../routeEvent";

export default async function updateFileState({ key, query }: IRouteEvent) {
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
