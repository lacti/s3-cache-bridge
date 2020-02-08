import { join } from "path";
import { cacheDir } from "../../env";

const lockDir = join(cacheDir, "lock");
export default lockDir;
