import { lstatSync, unlinkSync } from "fs";
import log from "../utils/log";

export default function unlinkOldLocalFiles(
  localFiles: string[],
  remainingCount: number
) {
  localFiles
    .map(localFile => ({
      localFile,
      stat: lstatSync(localFile)
    }))
    .sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime())
    .slice(remainingCount)
    .forEach(({ localFile }) => {
      log(`Delete old file`, localFile);
      unlinkSync(localFile);
    });
}
