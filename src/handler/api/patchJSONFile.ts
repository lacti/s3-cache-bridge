import getStream from "get-stream";
import * as jsonMod from "json-mod";
import { Readable } from "stream";
import lockGuard from "../../local/lock/lockGuard";
import IRouteEvent from "../routeEvent";
import readFile from "../support/readFile";
import writeFile from "../support/writeFile";

type AnyOperation =
  | jsonMod.AppendOperation
  | jsonMod.ModifyOperation
  | jsonMod.RemoveOperation;

type AnyOperationRequest = Omit<AnyOperation, "resource">;

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
  op: AnyOperationRequest;
  sync: boolean;
  fetch: boolean;
}) {
  const resource = await readFileOrNull(key);
  let newResource = null;
  try {
    newResource = jsonMod.dispatchOperation({
      ...op,
      resource
    } as AnyOperation);
  } catch (error) {
    throw {
      statusCode: 200,
      body: JSON.stringify({ _updated: false, error: error.message })
    };
  }

  await writeFile({
    key,
    readable: asStringStream(JSON.stringify(newResource)),
    append: false,
    sync
  });
  return !fetch
    ? undefined
    : asStringStream(JSON.stringify({ _updated: true, result: newResource }));
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
