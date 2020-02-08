import { S3 } from "aws-sdk";
import { Readable } from "stream";
import { bucketName } from "../env";
import s3 from "./s3";

export default async function s3Put(
  key: string,
  body: Readable
): Promise<S3.ManagedUpload.SendData> {
  return new Promise<S3.ManagedUpload.SendData>((resolve, reject) =>
    s3.upload(
      {
        Bucket: bucketName,
        Key: key,
        Body: body
      },
      (error: Error | undefined | null, data) => {
        if (error !== null && error !== undefined) {
          reject(error);
        } else {
          resolve(data);
        }
      }
    )
  );
}
