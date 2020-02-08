import { bucketName } from "../env";
import s3 from "./s3";

export default function s3Get(key: string) {
  return s3
    .getObject({
      Bucket: bucketName,
      Key: key
    })
    .createReadStream();
}
