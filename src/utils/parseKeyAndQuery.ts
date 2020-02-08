import { parse as parseURL } from "url";
import trimStartSlash from "./trimStartSlash";

export default function parseKeyAndQuery(url: string) {
  const { pathname, query } = parseURL(url, true);
  const key = trimStartSlash(pathname ?? "");
  if (key.length === 0) {
    throw new Error("No key in URL");
  }
  return { key, query };
}
