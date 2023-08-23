import { GetObjectCommand } from "@aws-sdk/client-s3";
import { bucketName } from "../env";
import s3 from "./s3";

export default async function s3Get(
  key: string
): Promise<NodeJS.ReadableStream | null> {
  const output = await s3.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  );
  return (output.Body as NodeJS.ReadableStream) ?? null;
}
