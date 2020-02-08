import { IncomingMessage } from "http";
import { ParsedUrlQuery } from "querystring";

export default interface IRouteEvent {
  req: IncomingMessage;
  key: string;
  query: ParsedUrlQuery;
}
