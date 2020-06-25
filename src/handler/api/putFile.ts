import IRouteEvent from "../routeEvent";
import lockGuard from "../../local/lock/lockGuard";
import writeFile from "../support/writeFile";

export default async function putFile({
  key,
  req: readable,
  query,
}: IRouteEvent): Promise<void> {
  const args = {
    key,
    readable,
    append: query.append === "1",
    sync: query.sync === "1",
  };
  return query.noLock === "1"
    ? writeFile(args)
    : lockGuard(key, () => writeFile(args));
}
