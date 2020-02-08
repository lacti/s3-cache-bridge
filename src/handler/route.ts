import { IncomingMessage, ServerResponse } from "http";
import acquireLock from "../local/lock/acquireLock";
import releaseLock from "../local/lock/releaseLock";
import log from "../utils/log";
import parseKeyAndQuery from "../utils/parseKeyAndQuery";
import authenticate from "./authenticate";
import routes from "./routes";

export default async function route(req: IncomingMessage, res: ServerResponse) {
  try {
    authenticate(req.headers.authorization ?? "");

    const { key, query: rawQuery } = parseKeyAndQuery(req.url ?? "");
    const query = { ...rawQuery };
    log(req.method, key, query);

    await acquireLock(key);
    try {
      const result = await (routes[req.method ?? ""] ?? noRoute)({
        req,
        key,
        query
      });
      if (result !== undefined) {
        return result;
      }
    } finally {
      releaseLock(key);
    }
    res.writeHead(200).end();
  } catch (error) {
    log("Error", error.message);
    res.writeHead(404).end();
  }
  return undefined;
}

async function noRoute() {
  throw new Error("No route");
}
