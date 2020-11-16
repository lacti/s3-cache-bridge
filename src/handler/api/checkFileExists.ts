import { existsSync, lstatSync } from "fs";

import Response from "../response";
import RouteEvent from "../routeEvent";
import keyAsLocalFile from "../../local/keyAsLocalFile";
import lockGuard from "../../local/lock/lockGuard";
import s3Head from "../../s3/head";

export default async function checkFileExists({
  key,
  query,
}: RouteEvent): Promise<Response<string>> {
  return query.noLock === "1"
    ? exists({ key })
    : lockGuard(key, () => exists({ key }));
}

async function exists({ key }: { key: string }): Promise<Response<string>> {
  // Check if there is a local file and it has a body.
  const localFile = keyAsLocalFile(key);
  if (existsSync(localFile)) {
    const stat = lstatSync(localFile);
    return existsAsResult(stat.size > 0);
  }

  // Or, check if S3 has that key.
  try {
    await s3Head(key);
    return existsAsResult(true);
  } catch (error) {}
  return existsAsResult(false);
}

function existsAsResult(result: boolean): Response<string> {
  if (result) {
    return { length: 0, value: "" };
  }
  throw { statusCode: 404, body: "" };
}
