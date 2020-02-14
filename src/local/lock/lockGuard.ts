import acquireLock from "./acquireLock";
import releaseLock from "./releaseLock";

export default async function lockGuard<R>(
  key: string,
  work: () => Promise<R>
) {
  await acquireLock(key);
  try {
    const result = await work();
    return result;
  } finally {
    releaseLock(key);
  }
}
