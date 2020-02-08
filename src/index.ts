import micro from "micro";
import { port } from "./env";
import route from "./handler/route";
import syncWithS3Periodically from "./local/syncWithS3Periodically";
import log from "./utils/log";
import once from "./utils/once";
import runningHandle from "./utils/runningHandle";
import sleep from "./utils/sleep";

micro(route).listen(port);
log(`Server is ready on`, port);

const handle = runningHandle(true);
syncWithS3Periodically(handle).catch(log);

["SIGINT", "SIGTERM"].forEach(signal =>
  process.on(
    signal as any,
    once(async () => {
      log("Catch stop signal");
      handle.update(false);

      log("Stop after 10 seconds");
      await sleep(10 * 1000);
      log("End");
      process.exit(0);
    })
  )
);
