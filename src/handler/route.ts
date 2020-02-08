import { IncomingMessage, ServerResponse } from "http";
import log from "../utils/log";
import parseKeyAndQuery from "../utils/parseKeyAndQuery";
import authenticate from "./authenticate";
import dispatch from "./dispatch";

export default async function route(req: IncomingMessage, res: ServerResponse) {
  try {
    authenticate(req.headers.authorization ?? "");

    const { key, query } = parseKeyAndQuery(req.url ?? "");
    log(req.method, key, query, req.headers);

    const result = await dispatch(req, key, query);
    if (result !== undefined) {
      return result;
    }
  } catch (error) {
    log(`Error`, error.message);
  }
  res.writeHead(404).end();
  return undefined;
}
