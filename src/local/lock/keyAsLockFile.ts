import * as filenamify from "filenamify";
import { join } from "path";
import lockDir from "./lockDir";

export default function keyAsLockFile(key: string): string {
  return join(lockDir, filenamify(key));
}
