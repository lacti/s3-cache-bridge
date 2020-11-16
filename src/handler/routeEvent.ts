import { IncomingMessage } from "http";
import { ParsedUrlQuery } from "querystring";

export default interface RouteEvent {
  req: IncomingMessage;
  key: string;
  query: ParsedUrlQuery;
}
