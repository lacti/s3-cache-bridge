import { createWriteStream } from "fs";
import s3Get from "./get";

export default async function s3Download(key: string, localFile: string) {
  return new Promise<void>((resolve, reject) => {
    try {
      const dest = createWriteStream(localFile);
      s3Get(key)
        .on("error", reject)
        .pipe(dest)
        .on("error", reject)
        .on("finish", resolve);
    } catch (error) {
      reject(error);
    }
  });
}
