import { IncomingMessage, ServerResponse } from "http";
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

    const result = await (routes[req.method ?? ""] ?? noRoute)({
      req,
      key,
      query
    });
    if (result !== undefined) {
      return result;
    }
    res.writeHead(200).end();
  } catch (error) {
    if ("statusCode" in error && "body" in error) {
      // Known error.
      const { statusCode, body } = error;
      log("Error", statusCode, body);
      res.writeHead(+statusCode);
      res.write(body);
      res.end();
    } else {
      // Unknown error.
      log("Error", error.message);
      res.writeHead(404).end();
    }
  }
  return undefined;
}

async function noRoute() {
  throw new Error("No route");
}
