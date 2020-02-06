import { S3 } from "aws-sdk";
import * as filenamify from "filenamify";
import * as fs from "fs";
import micro from "micro";
import pLimit from "p-limit";
import * as path from "path";
import * as stream from "stream";

const s3 = new S3();
const bucketName = process.env.BUCKET_NAME!;
const cacheDir = process.env.CACHE_DIR!;
const dirties = new Set<string>();
const port = +(process.env.PORT ?? "3000");

function s3Get(key: string) {
  return s3
    .getObject({
      Bucket: bucketName,
      Key: key
    })
    .createReadStream();
}

async function s3Download(key: string, localFile: string) {
  return new Promise<void>((resolve, reject) => {
    try {
      const dest = fs.createWriteStream(localFile);
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

async function s3Put(
  key: string,
  body: stream.Readable
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

async function s3Upload(key: string, localFile: string) {
  return new Promise<void>(async (resolve, reject) => {
    try {
      const src = fs.createReadStream(localFile).on("error", reject);
      await s3Put(key, src);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

async function s3Delete(key: string) {
  return s3
    .deleteObject({
      Bucket: bucketName,
      Key: key
    })
    .promise();
}

function keyAsLocalFile(key: string): string {
  return path.join(cacheDir, filenamify(key));
}

function sleep(millis: number) {
  return new Promise<void>(resolve => setTimeout(resolve, millis));
}

function ensureDirectory(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function ensureParentDirectory(filePath: string) {
  ensureDirectory(path.dirname(filePath));
}

function unlinkOldFiles(localFiles: string[], remainingCount: number) {
  localFiles
    .map(localFile => ({
      localFile,
      stat: fs.lstatSync(localFile)
    }))
    .sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime())
    .slice(remainingCount)
    .forEach(({ localFile }) => {
      console.info(`Delete old file`, localFile);
      fs.unlinkSync(localFile);
    });
}

function unlinkOutdatedFiles(remainingCount: number) {
  if (!fs.existsSync(cacheDir)) {
    return;
  }
  const files = fs.readdirSync(cacheDir);
  if (files.length <= remainingCount * 1.5) {
    return;
  }
  unlinkOldFiles(
    files.map(each => path.join(cacheDir, each)),
    remainingCount
  );
}

async function syncOne(key: string) {
  try {
    console.info(`Sync one`, key);
    await syncFile(key);
    dirties.delete(key);
  } catch (error) {
    console.error("Cannot sync key", key);
  }
}

async function syncPeriodically() {
  const waitSeconds = 10 * 1000;
  const maxFileCount = 4096;
  const limit = pLimit(8);
  while (true) {
    console.info(`Do sync`);
    const promises: Array<Promise<void>> = [];
    for (const key of dirties) {
      promises.push(limit(() => syncOne(key)));
    }
    await Promise.all(promises);

    unlinkOutdatedFiles(maxFileCount);
    await sleep(waitSeconds);
  }
}

async function getFile(key: string) {
  const localFile = keyAsLocalFile(key);
  if (!fs.existsSync(localFile)) {
    console.info(`Download file from S3`, key);
    ensureParentDirectory(localFile);
    try {
      await s3Download(key, localFile);
    } catch (error) {
      if (fs.existsSync(localFile)) {
        fs.unlinkSync(localFile);
      }
      throw error;
    }
  }

  const stat = fs.lstatSync(localFile);
  if (stat.size === 0) {
    throw new Error("Empty file");
  }

  console.info(`Get local file`, localFile);
  const readable = fs.createReadStream(localFile);
  console.log(readable);
  return readable;
}

async function putFile(key: string, readable: stream.Readable) {
  const localFile = keyAsLocalFile(key);
  console.info(`Upload local file`, key, localFile);

  dirties.add(key);
  ensureParentDirectory(localFile);
  return new Promise<void>((resolve, reject) =>
    readable
      .on("error", reject)
      .pipe(fs.createWriteStream(localFile))
      .on("error", reject)
      .on("finish", resolve)
  );
}

async function deleteFile(key: string) {
  invalidateCache(key);
  const deleted = s3Delete(key);
  console.info(`Delete file from S3`, key, deleted);
}

async function syncFile(key: string) {
  const localFile = keyAsLocalFile(key);
  if (!fs.existsSync(localFile)) {
    return;
  }
  console.info(`Upload to S3`, localFile, key);
  return s3Upload(key, localFile);
}

function invalidateCache(key: string) {
  const localFile = keyAsLocalFile(key);
  dirties.delete(key);
  if (fs.existsSync(localFile)) {
    console.info(`Delete local file`, localFile);
    fs.unlinkSync(localFile);
  }
}

function trimStartSlash(key: string) {
  while (key.startsWith("/")) {
    key = key.substring(1);
  }
  return key;
}

const server = micro(async req => {
  console.log(req.method, req.url, req.headers);
  const key = trimStartSlash(req.url ?? "");
  if (key.length === 0) {
    return "OK";
  }
  switch (req.method) {
    case "GET":
      try {
        const readable = await getFile(key);
        return readable;
      } catch (error) {
        console.error(`Error`, error.message);
        return "NoSuchKey";
      }
    case "PUT":
      await putFile(key, req);
      break;
    case "DELETE":
      await deleteFile(key);
      break;
    case "PATCH":
      invalidateCache(key);
      break;
  }
  return "OK";
});
server.listen(port);
console.info(`Server is ready on`, port);

syncPeriodically()
  .then(console.info)
  .catch(console.error);
