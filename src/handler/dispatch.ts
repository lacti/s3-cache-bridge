import { IncomingMessage } from "http";
import { ParsedUrlQuery } from "querystring";
import deleteFile from "./deleteFile";
import getFile from "./getFile";
import invalidateCache from "./invalidateCache";
import putFile from "./putFile";

export default async function dispatch(
  req: IncomingMessage,
  key: string,
  query: ParsedUrlQuery
) {
  switch (req.method) {
    case "GET":
      return getFile(key);
    case "PUT":
      return putFile(key, req);
    case "DELETE":
      if (query.meta === "1") {
        return invalidateCache(key);
      } else {
        return deleteFile(key);
      }
  }
}
