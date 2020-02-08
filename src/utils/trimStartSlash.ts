export default function trimStartSlash(key: string) {
  return key.replace(/^\/+/, "");
}
