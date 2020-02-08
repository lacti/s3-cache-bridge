import micro from "micro";
import { port } from "./env";
import route from "./handler/route";
import syncWithS3Periodically from "./local/syncWithS3Periodically";
import log from "./utils/log";

micro(route).listen(port);
log(`Server is ready on`, port);

syncWithS3Periodically()
  .then(console.info)
  .catch(console.error);
