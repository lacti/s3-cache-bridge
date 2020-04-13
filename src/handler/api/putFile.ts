import lockGuard from "../../local/lock/lockGuard";
import IRouteEvent from "../routeEvent";
import writeFile from "../support/writeFile";

export default async function putFile({
  key,
  req: readable,
  query
}: IRouteEvent) {
  const args = {
    key,
    readable,
    append: query.append === "1",
    sync: query.sync === "1"
  };
  return query.noLock === "1"
    ? writeFile(args)
    : lockGuard(key, () => writeFile(args));
}
