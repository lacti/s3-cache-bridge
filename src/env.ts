export const bucketName = process.env.BUCKET_NAME!;
export const cacheDir = process.env.CACHE_DIR!;
export const port = +(process.env.PORT ?? "3000");
export const syncMillis = +(process.env.SYNC_MILLIS ?? "3600000");

export const auth = {
  jwtSecretKey: process.env.JWT_SECRET_KEY,
  authId: process.env.AUTH_ID,
  authPassword: process.env.AUTH_PASSWORD
};
