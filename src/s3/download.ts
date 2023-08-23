import { createWriteStream } from "fs";
import s3Get from "./get";

export default async function s3Download(key: string, localFile: string) {
  return new Promise<void>(async (resolve, reject) => {
    try {
      const dest = createWriteStream(localFile);
      const readable = await s3Get(key);
      if (readable === null) {
        throw new Error(`Cannot find key: [key=${key}]`);
      }

      readable
        .on("error", reject)
        .pipe(dest)
        .on("error", reject)
        .on("finish", resolve);
    } catch (error) {
      reject(error);
    }
  });
}
