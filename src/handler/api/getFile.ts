import lockGuard from "../../local/lock/lockGuard";
import IRouteEvent from "../routeEvent";
import readFile from "../support/readFile";

export default async function getFile({ key, query }: IRouteEvent) {
  return query.noLock === "1"
    ? readFile({ key })
    : lockGuard(key, () => readFile({ key }));
}
