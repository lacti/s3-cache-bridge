import { bucketName } from "../env";
import s3 from "./s3";

export default function s3Head(key: string) {
  return s3.headObject({
    Bucket: bucketName,
    Key: key,
  });
}
