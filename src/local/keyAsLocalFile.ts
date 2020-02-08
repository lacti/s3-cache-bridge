import * as filenamify from "filenamify";
import { join } from "path";
import { cacheDir } from "../env";

export default function keyAsLocalFile(key: string): string {
  return join(cacheDir, filenamify(key));
}
