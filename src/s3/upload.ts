import { createReadStream } from "fs";
import log from "../utils/log";
import s3Put from "./put";

export default async function s3Upload(key: string, localFile: string) {
  return new Promise<void>(async (resolve, reject) => {
    try {
      const src = createReadStream(localFile).on("error", reject);
      const put = await s3Put(key, src);
      log("S3 Put completed", key, put.ETag);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}
