import { bucketName } from "../env";
import s3 from "./s3";

export default async function s3Delete(key: string) {
  return s3
    .deleteObject({
      Bucket: bucketName,
      Key: key
    })
    .promise();
}
