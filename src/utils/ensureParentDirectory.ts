import { dirname } from "path";
import ensureDirectory from "./ensureDirectory";

export default function ensureParentDirectory(filePath: string) {
  ensureDirectory(dirname(filePath));
}
