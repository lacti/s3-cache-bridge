import { createReadStream } from "fs";
import s3Put from "./put";

export default async function s3Upload(key: string, localFile: string) {
  return new Promise<void>(async (resolve, reject) => {
    try {
      const src = createReadStream(localFile).on("error", reject);
      await s3Put(key, src);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}
