import { cacheDir } from "../env";
import filenamify from "filenamify";
import { join } from "path";

export default function keyAsLocalFile(key: string): string {
  return join(cacheDir, filenamify(key));
}
