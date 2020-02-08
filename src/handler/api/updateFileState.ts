import keyAsLocalFile from "../../local/keyAsLocalFile";
import syncOneWithS3 from "../../local/syncOneWithS3";
import log from "../../utils/log";
import IRouteEvent from "../routeEvent";

export default async function updateFileState({ key, query }: IRouteEvent) {
  const localFile = keyAsLocalFile(key);
  log("Update a local file state", key, localFile, query);

  if (query.sync === "1") {
    log("Sync immediately", key);
    await syncOneWithS3(key);
  }
}
