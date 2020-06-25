import * as jsonMod from "json-mod";

import IRouteEvent from "../routeEvent";
import { Readable } from "stream";
import Response from "../response";
import getStream from "get-stream";
import lockGuard from "../../local/lock/lockGuard";
import readFile from "../support/readFile";
import writeFile from "../support/writeFile";

export default async function patchJSONFile({
  key,
  req,
  query,
}: IRouteEvent): Promise<void | Response<Readable>> {
  const args = {
    key,
    op: JSON.parse(await getStream(req)),
    sync: query.sync === "1",
    fetch: query.fetch === "1" ? true : query.fetch === "0" ? false : undefined,
  };
  return query.noLock === "1"
    ? applyPatchToJSON(args)
    : lockGuard(key, () => applyPatchToJSON(args));
}

async function applyPatchToJSON({
  key,
  op,
  sync,
  fetch,
}: {
  key: string;
  op: jsonMod.AnyOperation;
  sync: boolean;
  fetch?: boolean;
}): Promise<void | Response<Readable>> {
  if (!("operation" in op)) {
    throw new Error("Invalid request");
  }

  const resource = await readFileOrNull(key);
  let newResource = null;
  try {
    newResource = jsonMod.processOperation(resource, {
      ...op,
      path: op.path ?? "",
    });
  } catch (error) {
    throw {
      statusCode: 200,
      body: JSON.stringify({ _ok: false, error: error.message }),
    };
  }

  // Fetch is a just fetch. Please do not update a data file.
  if (op.operation !== "fetch") {
    await writeFile({
      key,
      readable: asStringStream(JSON.stringify(newResource)),
      append: false,
      sync,
    });
  }

  // It is a really bad thing because there is a case that requests fetch but no fetch query param.
  if (fetch === false || (fetch === undefined && op.operation !== "fetch")) {
    return;
  }
  const retrivalValue = JSON.stringify({ _ok: true, result: newResource });
  return {
    length: retrivalValue.length,
    value: asStringStream(retrivalValue),
  };
}

function asStringStream(input: string): Readable {
  const readable = new Readable();
  readable.push(input);
  readable.push(null);
  return readable;
}

async function readFileOrNull(
  key: string
): Promise<jsonMod.ResourceValue | null> {
  try {
    const { value: stream } = await readFile({ key });
    const content = await getStream(stream);
    if (content.length > 0) {
      return JSON.parse(content);
    }
    return null;
  } catch (error) {
    if (/(Empty file|key does not exist)/.test(error.message)) {
      return null;
    }
    throw error;
  }
}
