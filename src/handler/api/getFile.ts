import RouteEvent from "../routeEvent";
import lockGuard from "../../local/lock/lockGuard";
import readFile from "../support/readFile";

export default async function getFile({ key, query }: RouteEvent) {
  return query.noLock === "1"
    ? readFile({ key })
    : lockGuard(key, () => readFile({ key }));
}
