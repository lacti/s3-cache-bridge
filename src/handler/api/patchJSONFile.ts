import getStream from "get-stream";
import * as jsonMod from "json-mod";
import { Readable } from "stream";
import lockGuard from "../../local/lock/lockGuard";
import IRouteEvent from "../routeEvent";
import readFile from "../support/readFile";
import writeFile from "../support/writeFile";

export default async function patchJSONFile({
  key,
  req,
  query
}: IRouteEvent): Promise<void | Readable> {
  const args = {
    key,
    op: JSON.parse(await getStream(req)),
    sync: query.sync === "1",
    fetch: query.fetch === "1"
  };
  return query.noLock === "1"
    ? applyPatchToJSON(args)
    : lockGuard(key, () => applyPatchToJSON(args));
}

async function applyPatchToJSON({
  key,
  op,
  sync,
  fetch
}: {
  key: string;
  op: jsonMod.AnyOperation;
  sync: boolean;
  fetch: boolean;
}) {
  const resource = await readFileOrNull(key);
  let newResource = null;
  try {
    newResource = jsonMod.processOperation(resource, op);
  } catch (error) {
    throw {
      statusCode: 200,
      body: JSON.stringify({ _ok: false, error: error.message })
    };
  }

  // Fetch is a just fetch. Please do not update a data file.
  if (op.operation !== "fetch") {
    await writeFile({
      key,
      readable: asStringStream(JSON.stringify(newResource)),
      append: false,
      sync
    });
  }
  return !fetch
    ? undefined
    : asStringStream(JSON.stringify({ _ok: true, result: newResource }));
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
    const stream = await readFile({ key });
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
