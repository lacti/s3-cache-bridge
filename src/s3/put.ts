import { PutObjectCommandOutput } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { bucketName } from "../env";
import s3 from "./s3";

export default async function s3Put(
  key: string,
  body: Readable
): Promise<PutObjectCommandOutput> {
  return s3.putObject({
    Bucket: bucketName,
    Key: key,
    Body: body,
  });
}
